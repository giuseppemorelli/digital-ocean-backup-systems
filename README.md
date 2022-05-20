<h1 align="center">Digital Ocean Backup System</h1>

<div align="center">

![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/giuseppemorelli/digital-ocean-backup-systems?sort=semver&style=for-the-badge)
![GitHub](https://img.shields.io/github/license/giuseppemorelli/digital-ocean-backup-systems?style=for-the-badge)

</div>

Automate your snapshot system and copy into multiple regions of Digital Ocean Datacenter

## The "Digital Ocean Backup Problem"

Droplets backups are made only once a week.  
You cannot choose frequencies and also is only in 1 region.  
You cannot choose to copy to other regions.

You cannot create a backup of volume with a schedule, just manually

Migrate from backup to snapshot can avoid those problems and let you "free to choose".

## Requirements

- nodejs >= 14
- npm >= 6
- Digital Ocean API Token ([here](https://docs.digitalocean.com/reference/api/create-personal-access-token/) you can find a guide to create an API Token)

## Installation

Download the code from releases [list](https://github.com/giuseppemorelli/digital-ocean-backup-systems/releases/)

or clone with git

```bash
git clone https://github.com/giuseppemorelli/digital-ocean-backup-systems.git
```

Enter in project folder and run

```bash

npm install
cp .env.dit .env
```

## How to use

1) Edit `.env` as you like. Remember that `API_TOKEN` is a required data
2) Just run:

```bash
npm start
```

3) (optional) Add to your cronjob list on server

```bash
crontab -e

0 1 * * * /bin/bash /home/user/do-backup-system/bin/backup.sh
```

## Use with docker

Copy locally the env file sample

```bash
wget https://raw.githubusercontent.com/giuseppemorelli/digital-ocean-backup-systems/main/.env.dist envfile
```

Edit `envfile` as you like. Remember that `API_TOKEN` is a required data

```bash
docker run -it --name do-backup-system --env-file /path/of/envfile giuseppemorelli/do-backup-system:latest
```

### ENV Variables

| ENV NAME                 | DESCRIPTION                                                  | NOTE / EXAMPLE                    |
| ------------------------ | ------------------------------------------------------------ | --------------------------------- |
| API_TOKEN                | Digital Ocean API Token                                      |                                   |
| DO_REGION_COPY           | Slug region name that you want to copy your snapshots (increase security in case of disaster recovery) | Default is **'ams2**'             |
| REMOVE_OLD_SNAPSHOT_DAYS | Value in days that you want to remove old snapshots          | Default is '**30**'               |
| DROPLETS_TO_EXCLUDE      | Comma separated list of droplets that you don't want to backup with snapshots | Ex.<br />web00,web01,test-droplet |
| SNAPSHOTS_TO_EXCLUDE     | Comma separated list of snaphots that you don't want to backup with snapshots | Ex.<br />web-base, image-base     |
| VOLUME_TO_EXCLUDE        | Comma separated list of volume that you don't want to backup with snapshots | Ex.<br />mnt-base, volume-base     |



### Digital Ocean Datacenter Region Code List

More info here: https://docs.digitalocean.com/products/platform/availability-matrix/

| Slug | Name            |
| ---- | --------------- |
| nyc1 | New York 1      |
| nyc2 | New York 2      |
| nyc3 | New York 3      |
| sfo1 | San Francisco 1 |
| sfo2 | San Francisco 2 |
| sfo3 | San Francisco 3 |
| ams2 | Amsterdam 2     |
| ams3 | Amsterdam 3     |
| fra1 | Frankfurt 1     |
| tor1 | Toronto 1       |
| lon1 | London 1        |
| blr1 | Bangalore 1     |
| sgp1 | Singapore 1     |

## Contributing

In the spirit of Open Source, everyone is very welcome to contribute to this project.
You can contribute just by submitting bugs or suggesting improvements by
[opening an issue on GitHub](https://github.com/giuseppemorelli/digital-ocean-backup-systems/issues) or by [submitting a PR](https://github.com/giuseppemorelli/digital-ocean-backup-systems/pulls).

## License

Licensed under [MIT License](LICENSE). © Giuseppe Morelli.
