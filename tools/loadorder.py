"""LoadOrder - the order the source files must be bundled in, worked out from what each file needs at load time.

The game is one script: classes are not hoisted and top-level constants run in order, so a file has to come after
every file whose names it uses while loading (a class it extends, a constant it reads, a static field initialiser).
Names used only inside methods and functions are looked up later and do not count. Those load-time uses form a
directed graph; a topological sort of it (Kahn's algorithm) gives a valid order, a depth-first search finds any
cycle. Ties are broken by src/manifest.json through a min-heap, so a manifest that is already valid comes out
unchanged, and a file listed too early is moved just far enough.
    python3 tools/loadorder.py      check the manifest and print the graph's size
"""
import heapq, json, os, re
from collections import deque

ID = re.compile(r'[A-Za-z_$][\w$]*')


class LoadOrder:
    def __init__(self, src):
        self.src = src
        self.files = json.load(open(os.path.join(src, 'manifest.json'), encoding='utf-8'))
        self.text = {f: open(os.path.join(src, f), encoding='utf-8').read() for f in self.files}

    @staticmethod
    def strip(s):
        """Comments and string contents blanked out (same length), so braces and names in them are not counted."""
        out, i, n = list(s), 0, len(s)
        while i < n:
            c = s[i]
            if c == '/' and i + 1 < n and s[i + 1] == '/':
                j = s.find('\n', i)
                j = n if j < 0 else j
                out[i:j] = ' ' * (j - i)
                i = j
            elif c == '/' and i + 1 < n and s[i + 1] == '*':
                j = s.find('*/', i + 2)
                j = n if j < 0 else j + 2
                out[i:j] = ' ' * (j - i)
                i = j
            elif c in '\'"`':
                j = i + 1
                while j < n and s[j] != c:
                    j += 2 if s[j] == '\\' else 1
                out[i + 1:j] = ' ' * (j - i - 1)
                i = j + 1
            else:
                i += 1
        return ''.join(out)

    @staticmethod
    def scan(s):
        """(names declared at the top level, code run while the file loads)."""
        s = LoadOrder.strip(s)
        names, run, i, n = set(), [], 0, len(s)
        while i < n:
            m = re.compile(r'\s*(class|function|const|let|var)\b\s*').match(s, i)
            if not m:
                # an expression statement at the top level: runs now, up to its semicolon or newline at depth 0
                j = LoadOrder.end(s, i)
                run.append(s[i:j])
                i = j + 1
                continue
            kind, j = m.group(1), m.end()
            if kind == 'function':
                names.add(ID.match(s, j).group())
                b = s.index('{', j)
                i = LoadOrder.close(s, b) + 1
            elif kind == 'class':
                names.add(ID.match(s, j).group())
                b = s.index('{', j)
                run.append(s[j:b])                     # extends …
                e = LoadOrder.close(s, b)
                body, k = s[b + 1:e], 0
                # static field initialisers run when the class is defined; methods and instance fields do not
                for f in re.finditer(r'\bstatic\s+([A-Za-z_$][\w$]*)\s*=', body):
                    if LoadOrder.depth(body, f.start()) == 0:
                        run.append(body[f.end():LoadOrder.end(body, f.end())])
                i = e + 1
            else:
                e = LoadOrder.end(s, j)
                stmt, depth, start = s[j:e], 0, 0
                for k, c in enumerate(stmt + ','):
                    depth += c in '([{'
                    depth -= c in ')]}'
                    if c == ',' and depth == 0:
                        d = stmt[start:k]
                        nm = ID.match(d.strip())
                        if nm:
                            names.add(nm.group())
                        run.append(d.split('=', 1)[1] if '=' in d else '')
                        start = k + 1
                i = e + 1
        return names, ' '.join(run)

    @staticmethod
    def close(s, b):
        d = 0
        for k in range(b, len(s)):
            d += s[k] == '{'
            d -= s[k] == '}'
            if d == 0:
                return k
        return len(s)

    @staticmethod
    def depth(s, upto):
        return s.count('{', 0, upto) - s.count('}', 0, upto)

    @staticmethod
    def end(s, i):
        """End of the statement starting at i: a semicolon at depth 0, or the end of the text."""
        d = 0
        for k in range(i, len(s)):
            c = s[k]
            d += c in '([{'
            d -= c in ')]}'
            if c == ';' and d == 0:
                return k
        return len(s)

    @staticmethod
    def refs(run):
        """Names the load-time code reads: not property names after a dot, not keys in an object literal."""
        out = set()
        for m in ID.finditer(run):
            before, after = run[:m.start()].rstrip(), run[m.end():].lstrip()
            if before.endswith('.') or (after.startswith(':') and before[-1:] in ('{', ',')):
                continue
            out.add(m.group())
        return out

    def graph(self):
        """edges[a] = files that need a while loading."""
        decl, uses = {}, {}
        for f in self.files:
            names, run = self.scan(self.text[f])
            uses[f] = self.refs(run)
            for nm in names:
                decl.setdefault(nm, f)
        # a call made while loading (new X(…), f(…)) runs code that may reach any file X's file refers to, so it
        # needs that whole reach: breadth-first search over "this file mentions a name from that file"
        mentions = {f: {decl[n] for n in self.refs(self.strip(self.text[f])) if n in decl} - {f} for f in self.files}
        def reach(f):
            seen, queue = {f}, deque([f])
            while queue:
                for g in mentions[queue.popleft()]:
                    if g not in seen:
                        seen.add(g)
                        queue.append(g)
            return seen
        edges = {f: set() for f in self.files}
        for f in self.files:
            names, run = self.scan(self.text[f])
            called = {m.group(1) or m.group(2) for m in re.finditer(r'\bnew\s+([A-Za-z_$][\w$]*)|([A-Za-z_$][\w$]*)\s*\(', run)}
            for nm in uses[f]:
                g = decl.get(nm)
                if not g or g == f:
                    continue
                for h in (reach(g) if nm in called else {g}):
                    if h != f:
                        edges[h].add(f)
        return edges

    def cycle(self, edges):
        """A dependency cycle as a list of files, or None. Iterative DFS with white/grey/black colours."""
        colour, parent = {f: 0 for f in self.files}, {}
        for root in self.files:
            if colour[root]:
                continue
            stack = [(root, iter(sorted(edges[root])))]
            colour[root] = 1
            while stack:
                node, it = stack[-1]
                nxt = next(it, None)
                if nxt is None:
                    colour[node] = 2
                    stack.pop()
                elif colour[nxt] == 1:
                    path = [nxt, node]
                    while path[-1] != nxt:
                        path.append(parent[path[-1]])
                    return path[::-1]
                elif colour[nxt] == 0:
                    colour[nxt], parent[nxt] = 1, node
                    stack.append((nxt, iter(sorted(edges[nxt]))))
        return None

    def order(self):
        """Kahn's algorithm, ties broken by manifest position through a min-heap: O((V + E) log V)."""
        edges, pos = self.graph(), {f: i for i, f in enumerate(self.files)}
        indeg = {f: 0 for f in self.files}
        for a in edges:
            for b in edges[a]:
                indeg[b] += 1
        heap = [(pos[f], f) for f in self.files if indeg[f] == 0]
        heapq.heapify(heap)
        out = []
        while heap:
            _, f = heapq.heappop(heap)
            out.append(f)
            for g in edges[f]:
                indeg[g] -= 1
                if indeg[g] == 0:
                    heapq.heappush(heap, (pos[g], g))
        if len(out) < len(self.files):
            raise ValueError('load-time dependency cycle: ' + ' -> '.join(self.cycle(edges)))
        return out, edges


if __name__ == '__main__':
    lo = LoadOrder(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src'))
    order, edges = lo.order()
    moved = [f for f, g in zip(lo.files, order) if f != g]
    print(f'{len(order)} files, {sum(map(len, edges.values()))} load-time dependencies; '
          + ('the manifest order is valid' if not moved else f'{len(moved)} files out of order'))
    if moved:
        print('order needed:\n  ' + '\n  '.join(order))
