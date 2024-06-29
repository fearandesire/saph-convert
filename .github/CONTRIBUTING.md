# Contributing

## Workflow

1. Fork and clone this repository.
2. Create a new branch in your fork based off the **main** branch.
3. Make your changes.
4. Commit your changes, and push them.
5. Submit a Pull Request!

## Contributing to the code

\*\*The issue tracker is only for issue reporting or proposals/suggestions. If you have a question, you can find me on
[Discord DM]!\*\*

To contribute to this repository, feel free to create a new fork of the repository and submit a pull request. We highly
suggest [ESLint] to be installed in your text editor or IDE of your choice to ensure builds from GitHub Actions do not
fail.

**_Before committing and pushing your changes, please ensure that you do not have any linting errors by running
`yarn lint`!_**

### Concept Guidelines

There are a number of guidelines considered when reviewing Pull Requests to be merged. _This is by no means an
exhaustive list, but here are some things to consider before/while submitting your ideas._

-   Everything should be generally useful for the majority of users. Don't let that stop you if you've got a
    good concept though, as your idea still might be a great addition.
-   Everything should be shard compliant. If code you put in a pull request would break when sharding, break other things
    from supporting sharding, or is incompatible with sharding; then you will need to think of a way to make it work with
    sharding in mind before the pull request will be accepted and merged.
-   Everything should follow [OOP paradigms][oop paradigms] and generally rely on behaviour over state where possible.
    This generally helps methods be predictable, keeps the codebase simple and understandable, reduces code duplication
    through abstraction, and leads to efficiency and therefore scalability.
-   Everything should follow our ESLint rules as closely as possible, and should pass lint tests even if you must disable
    a rule for a single line.
-   Scripts that are to be ran outside of the scope of the bot should be added to a `scripts` directory at the root and
    should be in the `.mjs` file format.

<!-- Link Dump -->

[discord dm]: https://discord.com/users/208016830491525120
[eslint]: https://eslint.org/
[node.js]: https://nodejs.org/en/download/
[yarn]: https://yarnpkg.com/getting-started/install
[oop paradigms]: https://en.wikipedia.org/wiki/Object-oriented_programming
