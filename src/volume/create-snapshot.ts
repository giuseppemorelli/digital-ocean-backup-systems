import client from '../client.js';
import csvAsync from 'async-csv';
import { createObjectCsvWriter } from 'csv-writer';
import { promises as fs } from 'fs';

// Volume list to exclude from snapshot
let volumeToExclude: string[] = [];
let envVolumeToExclude = process.env.VOLUME_TO_EXCLUDE || '';
if (envVolumeToExclude !== '') {
    volumeToExclude = envVolumeToExclude.split(',');
}
const today = new Date().toISOString().substring(0, 10);
const CSV_SNAPSHOTFILE = 'snapshot_volume_list.csv';

export async function createVolumeSnapshot() {
    let snapshotCreatedList = [];
    let actionsList: unknown[] = [];

    const input = {
        per_page: 100,
    }
    let volumeList = await client.volume.listVolumes(input);
    let snapshotList = await client.snapshot.listSnapshots(input);

    // Read CSV list of snapshot created for running checking
    const csvString = await fs.readFile('./var/' + CSV_SNAPSHOTFILE, 'utf-8')
        .catch(
            function () {
                console.log('NO SNAPSHOT FILE FOUND');
            }
        );

    if (csvString) {
        actionsList = await csvAsync.parse(csvString);
    }

    for (const volume of volumeList.data.volumes) {
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
        for (const snapshot of snapshotList.data.snapshots) {
            if (snapshot.name === slug) {
                console.log("|-> WARNING! Found a snapshot with same slug " + slug);
                found = true;
                break;
            }
        }

        // Check if there is a running snapshot process via actions on CSV
        for (const action of actionsList) {
            // @ts-ignore
            if (Number.parseInt(action[1]) === volume.id) {
                // @ts-ignore
                let actionResponse = await client.volume.getVolumeAction(volume.id, action[2]);
                if (actionResponse.data.action.status !== 'completed') {
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
                const input = {
                    volume_id: volume.id,
                    name: slug
                };
                let snapshotCreated = await client.volume.createVolumeSnapshot(input);
                let output = {
                    'volume_name': volume.name,
                    'volume_id': volume.id,
                    'action_id': snapshotCreated.data.snapshot.id
                }
                console.log(output);
                snapshotCreatedList.push(output);
            } catch (error: any) {
                console.log('ERROR! ' + error.body.message + ' -> SKIP');
            }
        } else {
            console.log('|-> Skip');
        }
    }

    // Write on CSV snapshot action list
    if (snapshotCreatedList.length > 0) {
        const csv = createObjectCsvWriter(
            {
                path: './var/' + CSV_SNAPSHOTFILE,
                header: ['volume_name', 'volume_id', 'action_id'],
                append: true
            }
        );

        await csv.writeRecords(snapshotCreatedList).then(() => console.log('|-> SNAPSHOT list action saved on CSV!'));
    }
}
