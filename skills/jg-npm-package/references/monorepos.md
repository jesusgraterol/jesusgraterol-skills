## Publishing from a monorepo

- Depend on published sibling packages through `workspace:^` ranges, and check that the packed manifest holds real version ranges, such as `^1.4.0`, never a `workspace:` range.
- A package that depends on a private workspace package can't be published: keep it private as well, or publish the dependency first.
- Tag releases as `<package>-v<version>`, such as `ui-v2.3.0`, so each package keeps its own release history.
- Publish in dependency order. Before publishing a dependent, wait for its dependency's new version to appear on the registry, polling a bounded number of times.
- When package bytes cross CI jobs, such as a tarball built in one job and published in another, verify its checksum before publishing.
- Shipped declaration files never reference a private package's `.d.ts` files, because consumers can't resolve them.
