---
name: jg-docker
description: Docker Compose and Dockerfile standards for reproducible, private-by-default containers and safe Compose operations. Use when writing, reviewing, or planning compose.yaml or docker-compose files, Compose services, profiles, healthchecks, secrets, or published ports, Dockerfiles or .dockerignore files, container image tags, or commands that recreate or remove Compose services, volumes, or their data.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is Docker Compose files and operations, Dockerfiles and `.dockerignore` files, and container image tags. Shell inside `RUN` instructions and entrypoint scripts follows jg-bash.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for Docker Engine 29, Docker Compose 5.6, and Dockerfile syntax 1.28. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Before relying on one of this skill's version-specific items, check it against the current official guidance when the installed version of the technology is newer than the one this skill was written for, or when the version bullet gives a review month for something without an installed version, such as a hosted service or browser behavior, and that month is more than six months before the current date. Where an item differs from that guidance, follow the guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- This skill isn't a complete list. Where it says nothing, follow the official guidance for the installed version, and in new code the task touches, prefer the features that guidance currently recommends over older ones that do the same job, unless the repository has an established pattern for that job. Before using a newer approach instead of one this skill gives, confirm it in that version's official documentation, never from memory alone, and report the item as outdated as described above. When that documentation can't be reached, keep this skill's approach and report that the newer approach couldn't be confirmed, without pausing the run.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Changing infrastructure

- Propose changes to the Docker daemon, registries, and Dependabot configuration instead of making them.
- When a Compose file is generated, change its generator, never the generated file.

## Compose files

- Prefer a top-level `name:`. Every worktree of the repository then shares that project, with its containers and volumes, so give a worktree its own project name with `-p` or `COMPOSE_PROJECT_NAME` when it needs separate ones. Leave `container_name` out of new services unless tooling needs a fixed name.
- Require values with `${VAR:?message}`, so a missing one fails with a clear message, and write `$$` for a literal `$`.
- Prefer profiles when infrastructure and applications start separately, and stop every profile with `docker compose --profile "*" down`.
- Never publish data or admin ports, such as databases, caches, or dashboards, on all interfaces, and prefer binding every published port to `127.0.0.1:`.
- Give services healthchecks that use tools inside the image and probe the interface clients connect to. Make dependents wait with `condition: service_healthy`, or `service_completed_successfully` for one-off jobs, and start with `docker compose up --wait --wait-timeout <seconds>`. (Compose 2.20.2+, Engine 25+) Set `start_period` with `start_interval`, so a slow start isn't counted as failures.
- Never put credentials in `environment`, build args, or image layers. Pass them as file secrets read through `*_FILE` variables, keep the host files readable only by their owner and ignored by Git, and use `RUN --mount=type=secret` at build time.
- Rotate logs through one `x-logging` anchor shared by every service, with `driver: local`, `max-size`, and `max-file`.
- Pin third-party images to exact tags that include their variant, such as `postgres:18.1-alpine`, never `latest`. Pin digests only when the numbers justify it, and prefer immutable commit-SHA tags for your own images.

## Dockerfiles

- Use multi-stage builds, with a runtime stage that holds only production dependencies and build output.
- Copy dependency manifests and install them before copying sources, and use cache mounts, such as `RUN --mount=type=cache,target=/root/.npm`, for package caches.
- Keep a reviewed `.dockerignore`, so secrets, `.git`, and local build output never enter the build context.
- Prefer a non-root `USER` in the runtime stage.
- Use exec-form `ENTRYPOINT` and `CMD`, such as `CMD ["node", "dist/main.js"]`, with an init process, such as `init: true` in Compose, so signals reach the app and exited child processes are reaped.
- Never put secrets in `ARG` or `ENV`, which persist in the image's metadata.
- (Node.js 25+) Node.js no longer ships Corepack, so install the package manager explicitly instead of running `corepack enable`.
- Check Dockerfiles with `docker build --check`.

## Operating Compose

- Change one service with `docker compose up --wait --no-deps <service>`, adding `--force-recreate` only for changes Compose can't detect, such as an edited file mounted into the container.
- Never run `docker compose down` on the whole project, or pass `-v`, to change one service.
- Before any command that destroys volumes or data, verify that:
  - the Docker context is local, and `DOCKER_HOST` or `DOCKER_CONTEXT` doesn't override it;
  - the project name and services are the expected ones;
  - the containers' `com.docker.compose.project.working_dir` label is this checkout;
  - the published ports are bound to loopback.

## When the numbers justify it

- Pinning images by digest, at the cost of updating them by hand or with a bot.
- Building images from a pruned workspace with `turbo prune` or `pnpm deploy`, as jg-monorepo describes.
- Distroless runtime images, at the cost of having no shell for debugging.

## Verification

- Validate Compose files with `docker compose config --quiet`, and Dockerfiles with `docker build --check`.
