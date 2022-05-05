import client from './client.js'

const daysToCheck = process.env.REMOVE_OLD_SNAPSHOT_DAYS || '30';
const today = new Date();

// Snapshot list to exclude from remove action
let snapshotToExclude = process.env.SNAPSHOTS_TO_EXCLUDE || [];
if (snapshotToExclude.length > 0) {
    snapshotToExclude = snapshotToExclude.split(',');
}

export async function removeSnapshot() {
    let snapshotList = await client.images.list({
        private: true
    });

    for (const snapshot of snapshotList) {

        // Check if snapshot is excluded
        if (snapshotToExclude.includes(snapshot.name)) {
            console.log("|-> WARNING! Snapshot of droplet excluded " + snapshot.name);
            continue;
        }

        const createdAt = new Date(snapshot.created_at);
        const diffDate = today.getTime() - createdAt.getTime();

        if (Number.parseInt(diffDate / (24 * 3600 * 1000)) >= Number.parseInt(daysToCheck)) {
            console.log('|-> SNAPSHOT ' + snapshot.name + ' will be deleted');

            let response = await client.images.delete(snapshot.id);

            if (response) {
                console.log('|--> done!');
                console.log("---------------------------------------------------------");
            }
        } else {
            console.log('|-> SNAPSHOT ' + snapshot.name + ' is too young, skipped');
        }
    }

    let volumeList = await client.volumes.list();

    for (const volume of volumeList) {

        let volumeSnapshots = await client.volumes.snapshots(volume.id);

        for (const snapshot of volumeSnapshots) {
            // Check if snapshot is excluded
            if (snapshotToExclude.includes(snapshot.name)) {
                console.log("|-> WARNING! Snapshot of volume excluded " + snapshot.name);
                continue;
            }

            const createdAt = new Date(snapshot.created_at);
            const diffDate = today.getTime() - createdAt.getTime();

            if (Number.parseInt(diffDate / (24 * 3600 * 1000)) >= Number.parseInt(daysToCheck)) {
                console.log('|-> SNAPSHOT ' + snapshot.name + ' will be deleted');

                let response = await client.images.delete(snapshot.id);

                if (response) {
                    console.log('|--> done!');
                    console.log("---------------------------------------------------------");
                }
            } else {
                console.log('|-> SNAPSHOT ' + snapshot.name + ' is too young, skipped');
            }
        }
    }
}
