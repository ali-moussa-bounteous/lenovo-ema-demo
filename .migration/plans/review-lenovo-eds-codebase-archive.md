# Plan: Review the Lenovo EDS codebase archive

## Status
I can't do this review yet. The archive is a compressed file, and in planning mode I can only read plain files, so I can't list, decompress or extract it. Run the checklist below in Execute mode. The findings summary is the result you'll get at the end.

## What I found so far
- The archive is in the project root and is about 14.5 MB.
- The project already has a top-level `migration-work` folder. If I unpack the archive straight into the project, files with matching names (`migration-work/`, `blocks/`, `scripts/`, `styles/`) could overwrite the current project files.
- `.hlxignore` doesn't exclude the archive. Every committed file is published, so whatever I unpack shouldn't be committed by accident.

## Approach
1. **Unpack to a separate scratch folder** outside the project, such as a temporary directory, so nothing in the current project changes. If you want the files inside the project, I'll ask you first and add the folder to `.gitignore` and `.hlxignore`.
2. **Read the instructions first.** Go through everything in the archive's `migration-work` folder: markdown and text files, page and template configs, block mappings and any prompts or step-by-step instructions.
3. **Map the rest of the codebase.** Skip `node_modules`. Look at:
   - Blocks: names, variants, what each one does and how it handles content
   - Global scripts and styles: `scripts.js`, auto-blocking, design tokens, fonts
   - Header, footer and nav setup
   - Import tooling (`tools/importer`, parsers, transformers, page templates), if present
   - Sample content, page templates and metadata
   - Project setup (document-based, DA or Universal Editor; content source)
4. **Compare with this project**, which is a near-empty boilerplate. Note what could be reused as-is, what needs changes, and what's out of date (for example, retired files like `fstab.yaml` or `helix-query.yaml`).
5. **Report back** with a plain-language summary. I won't change any project files.

## Checklist
- [ ] Switch to Execute mode (unpacking needs it)
- [ ] List the archive contents and check for name clashes with the current project
- [ ] Unpack the archive to a separate scratch folder, not over the project
- [ ] Read every instruction file in `migration-work`
- [ ] List and summarize blocks, variants and how each one decorates content
- [ ] Review global scripts, styles, fonts and design tokens
- [ ] Review header, footer and nav
- [ ] Review import tooling and page templates, if present
- [ ] Identify the source Lenovo pages/URLs and the page templates covered
- [ ] Flag outdated or risky items (retired config files, edits to vendored `aem.js`, secrets or tokens in files)
- [ ] Compare with the current project and list what can be reused
- [ ] Write the findings summary and suggest next steps
- [ ] Leave the current project unchanged (confirm with git status)

## What the findings summary will cover
- **Purpose and scope:** which Lenovo experience was built, and which pages and templates
- **Workflow:** the step-by-step process in `migration-work`
- **Block inventory:** blocks and variants, with a short note on each
- **Design system:** colors, typography, spacing, fonts
- **Content and import:** how content was structured or imported
- **Gaps and risks:** outdated, incomplete or problem items
- **Recommended next steps** for using it in this project
