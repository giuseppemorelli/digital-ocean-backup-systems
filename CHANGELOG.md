# Digital Ocean Backup System

### Changed
- simplify bash script

## 0.5.0

### Changed
- moving to Typescript
- change DO library to dots-wrapper

### Removed
- docker auto-build with tagged version

## 0.4.1

### Added

- create Dockerfile for run software in a container
- github actions for publish docker container to docker hub

## 0.4.0

### Added

- create snapshots of DO volumes
- remove old snapshots of DO volumes

### Changed

- update digital ocean library

## 0.3.2

### Changed

- remove-snapshot.js problem with calculate difference date to remove old snapshot

## 0.3.1

### Changed

- client.js not initialized correctly

## 0.3.0

### Added

- bash script for simplify cronjobs server

### Changed

- [#7](https://github.com/giuseppemorelli/digital-ocean-backup-systems/issues/7) snapshot exclude list moved to .env
  file
- [#8](https://github.com/giuseppemorelli/digital-ocean-backup-systems/issues/8) droplet exclude list moved to .env file

## 0.2.0

### Added

- [#2](https://github.com/giuseppemorelli/digital-ocean-backup-systems/issues/2) action to remove old snapshots

### Changed

- [#3](https://github.com/giuseppemorelli/digital-ocean-backup-systems/issues/3) improve code of copySnapshot()

## 0.1.0

Beta release
