---
description: Host Ghost to publish blogs and newsletters with Diploi.
summary: An open-source content management system designed for publishing and managing blogs, online publications or websites.
links:
  - label: 'Tutorial: hosting a Ghost blog on Diploi'
    href: https://diploi.com/blog/hosting_a_ghost_blog
---

Ghost is an open-source content platform for publishing blogs, newsletters, and membership sites. Use this component when you want Diploi to manage builds and deployments for a Ghost site. It keeps your content workflow together with the infrastructure that serves it.

<!-- more -->

## Database

Ghost stores its content in MariaDB. When you pick Ghost in the Stack Builder, the [MariaDB add-on](/building/add-ons/mariadb) and the environment variable mapping below are added to your project automatically. If you add Ghost to an existing project by editing `diploi.yaml` yourself, add them too:

```yaml
components:
  - name: Ghost
    identifier: ghost
    package: {{package}}
    env:
      include:
        - mariadb.MARIADB_HOST:database__connection__host
        - mariadb.MARIADB_USER:database__connection__user
        - mariadb.MARIADB_PASSWORD:database__connection__password
addons:
  - name: MariaDB
    identifier: mariadb
    package: {{package:mariadb}}
```

The mapping is needed because Ghost reads its database settings from `database__connection__*` variables.
