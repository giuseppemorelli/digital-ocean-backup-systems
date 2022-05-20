import client from '../client.js';
import csvAsync from 'async-csv';
import { createObjectCsvWriter } from 'csv-writer';
import { promises as fs } from 'fs';

// Droplet list to exclude from snapshot
let dropletToExclude: string[] = [];
let envDropletToExclude = process.env.DROPLETS_TO_EXCLUDE || '';
if (envDropletToExclude !== '') {
    dropletToExclude = envDropletToExclude.split(',');
}
const today = new Date().toISOString().substring(0, 10);
const CSV_SNAPSHOTFILE = 'snapshot_list.csv';

export async function createSnapshot() {
    let snapshotCreatedList = [];
    let actionsList: unknown[] = [];

    const input = {
        per_page: 100,
    }
    let dropletList = await client.droplet.listDroplets(input);
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

    for (const droplet of dropletList.data.droplets) {
        console.log('');
        console.log("*********************************");
        console.log("MANAGE: " + droplet.name);
        console.log("*********************************");

        // Check if droplet is excluded
        if (dropletToExclude.includes(droplet.name)) {
            console.log("|-> WARNING! Droplet excluded " + droplet.name);
            continue;
        }

        let slug = droplet.name + '_' + today;
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
            if (Number.parseInt(action[1]) === droplet.id) {
                const input = {
                    // @ts-ignore
                    action_id: Number.parseInt(action[2]),
                    droplet_id: droplet.id,
                };
                let actionResponse = await client.droplet.getDropletAction(input);

                if (actionResponse.data.action.status !== 'completed') {
                    found = true;
                    console.log('|-> There is another snapshot process for this droplet, skipped!');
                }
            }
        }

        // Everything is ok, we can create a snapshot
        if (!found) {
            console.log('|-> CREATE SNAPSHOT for ' + droplet.name);
            const input = {
                droplet_id: droplet.id,
                name: slug
            };
            let snapshotCreated = await client.droplet.snapshotDroplet(input);
            const output = {
                'droplet_name': droplet.name,
                'droplet_id': droplet.id,
                'action_id': snapshotCreated.data.action.id
            }
            snapshotCreatedList.push(output);
        } else {
            console.log('|-> Skip');
        }
    }

    // Write on CSV snapshot action list
    if (snapshotCreatedList.length > 0) {
        const csv = createObjectCsvWriter(
            {
                path: './var/' + CSV_SNAPSHOTFILE,
                header: ['droplet_name', 'droplet_id', 'action_id'],
                append: true
            }
        );

        await csv.writeRecords(snapshotCreatedList).then(() => console.log('|-> SNAPSHOT list action saved on CSV!'));
    }
}
