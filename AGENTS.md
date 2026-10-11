<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Reading journal architecture
- Keep the tracker on the index route with chapters rendered inside a shared book shell, because page turns are an in-book interaction rather than separate URLs.
- Keep all journal persistence in one hydration-safe browser storage hook and validate imported JSON before replacing the journal, because this app intentionally has no server storage.
- Keep book, soundtrack, quote and goal controls in focused reusable modules, because beginner-readable code and independent chapter behavior are priorities.
- Keep decorative styling and animation in the global token-based design system, because the antique book needs consistent surfaces, contrast and reduced-motion behavior.
