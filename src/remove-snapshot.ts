import client from './client.js';

const daysToCheck = process.env.REMOVE_OLD_SNAPSHOT_DAYS || '30';
const today = new Date();

// Snapshot list to exclude from remove action
let snapshotToExclude: string[] = [];
let envSnapshotToExclude = process.env.SNAPSHOTS_TO_EXCLUDE || '';
if (envSnapshotToExclude !== '') {
    snapshotToExclude = envSnapshotToExclude.split(',');
}

export async function removeSnapshot() {
    const input = {
        per_page: 100,
    };
    let snapshotList = await client.snapshot.listSnapshots(input);

    for (const snapshot of snapshotList.data.snapshots) {
        // Check if snapshot is excluded
        if (snapshotToExclude.includes(snapshot.name)) {
            console.log("|-> WARNING! Snapshot of droplet excluded " + snapshot.name);
            continue;
        }

        const createdAt = new Date(snapshot.created_at);
        const diffDate = today.getTime() - createdAt.getTime();

        if ((diffDate / (24 * 3600 * 1000)) >= Number.parseInt(daysToCheck)) {
            console.log('|-> SNAPSHOT ' + snapshot.name + ' will be deleted');
            const input = {
                snapshot_id: snapshot.id
            }
            let response = await client.snapshot.deleteSnapshot(input)

            if (response) {
                console.log('|--> done!');
                console.log("---------------------------------------------------------");
            }
        } else {
            console.log('|-> SNAPSHOT ' + snapshot.name + ' is too young, skipped');
        }
    }

    const inputVolume = {
        per_page: 100,
    }
    let volumeList = await client.volume.listVolumes(inputVolume);

    for (const volume of volumeList.data.volumes) {
        const input = {
            volume_id: volume.id
        }
        let volumeSnapshots = await client.volume.listVolumeSnapshots(input);

        for (const snapshot of volumeSnapshots.data.snapshots) {
            // Check if volume snapshot is excluded
            if (snapshotToExclude.includes(snapshot.name)) {
                console.log("|-> WARNING! Snapshot of volume excluded " + snapshot.name);
                continue;
            }

            const createdAt = new Date(snapshot.created_at);
            const diffDate = today.getTime() - createdAt.getTime();

            if ((diffDate / (24 * 3600 * 1000)) >= Number.parseInt(daysToCheck)) {
                console.log('|-> VOLUME SNAPSHOT ' + snapshot.name + ' will be deleted');

                const input = {
                    image_id: Number.parseInt(snapshot.id)
                }
                let response = await client.image.deleteImage(input);

                if (response) {
                    console.log('|--> done!');
                    console.log("---------------------------------------------------------");
                }
            } else {
                console.log('|-> VOLUME SNAPSHOT ' + snapshot.name + ' is too young, skipped');
            }
        }
    }
}
