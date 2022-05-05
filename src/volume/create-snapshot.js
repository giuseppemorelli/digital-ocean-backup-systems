import client from '../client.js';
import csvWriter from 'csv-writer';
import fsPromises from 'fs/promises';
import csvAsync from 'async-csv';

// Droplet list to exclude from snapshot
let volumeToExclude = process.env.VOLUME_TO_EXCLUDE || [];
if (volumeToExclude.length > 0) {
    volumeToExclude = volumeToExclude.split(',');
}
const today = new Date().toISOString().substring(0, 10);
const CSV_SNAPSHOTFILE = 'snapshot_volume_list.csv';

export async function createVolumeSnapshot() {
    let snapshotCreatedList = [];
    let actionsList = [];
    let volumeList = await client.volumes.list();
    let snapshotList = await client.snapshots.list();

    // Read CSV list of snapshot created for running checking
    const csvString = await fsPromises.readFile('./var/' + CSV_SNAPSHOTFILE, 'utf-8')
        .catch(
            function (error) {
                console.log('NO SNAPSHOT FILE FOUND');
            }
        );

    if (csvString) {
        actionsList = await csvAsync.parse(csvString);
    }

    for (const volume of volumeList) {
        console.log('');
        console.log("*********************************");
        console.log("MANAGE: " + volume.name);
        console.log("*********************************");

        // Check if droplet is excluded
        if (volumeToExclude.includes(volume.name)) {
            console.log("|-> WARNING! Volume excluded " + volume.name);
            continue;
        }

        let slug = volume.name + '_' + today;
        let found = false;

        // Check if there is a snapshot with the same slug
        for (const snapshot of snapshotList) {
            if (snapshot.name === slug) {
                console.log("|-> WARNING! Found a snapshot with same slug " + slug);
                found = true;
                break;
            }
        }

        // Check if there is a running snapshot process via actions on CSV
        for (const action of actionsList) {
            if (Number.parseInt(action[1]) === volume.id) {
                let actionResponse = await client.volumes.getAction(volume.id, action[2]);
                if (actionResponse.status !== 'completed') {
                    found = true;
                } else {
                    console.log('|-> There is another snapshot process for this volume, skipped!');
                }
            }
        }

        // Everything is ok, we can create a snapshot
        if (!found) {
            console.log('|-> CREATE SNAPSHOT for ' + volume.name);

            try {
                let snapshotCreated = await client.volumes.snapshot(volume.id, slug);
                let output = {
                    'volume_name': volume.name,
                    'volume_id': volume.id,
                    'action_id': snapshotCreated.id
                }
                console.log(output);
                snapshotCreatedList.push(output);
            } catch (error) {
                console.log('ERROR! ' + error.body.message + ' -> SKIP');
            }
        } else {
            console.log('|-> Skip');
        }
    }

    // Write on CSV snapshot action list
    if (snapshotCreatedList.length > 0) {
        const csv = csvWriter.createObjectCsvWriter(
            {
                path: './var/' + CSV_SNAPSHOTFILE,
                header: ['volume_name', 'volume_id', 'action_id'],
                append: true
            }
        );

        await csv.writeRecords(snapshotCreatedList).then(() => console.log('|-> SNAPSHOT list action saved on CSV!'));
    }
}
