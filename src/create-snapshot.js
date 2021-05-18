import client from './client.js';
import csvWriter from 'csv-writer';
import * as fs from 'fs';
import fsPromises from 'fs/promises';
import csvAsync from 'async-csv';

// Droplet list to exclude from snapshot
let dropletToExclude = process.env.DROPLET_TO_EXCLUDE || [];
if (dropletToExclude.length > 0) {
    dropletToExclude = dropletToExclude.split(',');
}
const today = new Date().toISOString().substring(0, 10);
const CSV_SNAPSHOTFILE = 'snapshot_list.csv';

export async function createSnapshot() {
    let snapshotCreatedList = [];
    let actionsList = [];
    let dropletList = await client.droplets.list();
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

    for (const droplet of dropletList) {
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
        for (const snapshot of snapshotList) {
            if (snapshot.name === slug) {
                console.log("|-> WARNING! Found a snapshot with same slug " + slug);
                found = true;
                break;
            }
        }

        // Check if there is a running snapshot process via actions on CSV
        for (const action of actionsList) {
            if (Number.parseInt(action[1]) === droplet.id) {
                let actionResponse = await client.droplets.getAction(droplet.id, action[2]);
                if (actionResponse.status !== 'completed') {
                    found = true;
                } else {
                    console.log('|-> There is another snapshot process for this droplet, skipped!');
                }
            }
        }

        // Everything is ok, we can create a snapshot
        if (!found) {
            console.log('|-> CREATE SNAPSHOT for ' + droplet.name);

            let snapshotCreated = await client.droplets.snapshot(droplet.id, slug);
            let output = {
                'droplet_name': droplet.name,
                'droplet_id': droplet.id,
                'action_id': snapshotCreated.id
            }
            console.log(output);
            snapshotCreatedList.push(output);
        } else {
            console.log('|-> Skip');
        }
    }

    // Write on CSV snapshot action list
    if (snapshotCreatedList.length > 0) {
        const csv = csvWriter.createObjectCsvWriter(
            {
                path: './var/' + CSV_SNAPSHOTFILE,
                header: ['droplet_name', 'droplet_id', 'action_id'],
                append: true
            }
        );

        await csv.writeRecords(snapshotCreatedList).then(() => console.log('|-> SNAPSHOT list action saved on CSV!'));
    }
}
