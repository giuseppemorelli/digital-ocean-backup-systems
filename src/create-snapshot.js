import client from './client.js';
import csvWriter from 'csv-writer'

const today = new Date().toISOString().substring(0, 10)
const dropletToExclude = ['web00', 'web01', 'redis', 'nfs', 'web-cron', 'db']

export async function createSnapshot()
{
    let snapshotCreatedList = [];
    let dropletList = await client.droplets.list();
    let snapshotList = await client.snapshots.list();

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
                continue;
            }
        }

        // Check if there is a snapshot in progress
        // @TODO

        if (!found) {
            console.log("|->  CREATE SNAPSHOT for " + droplet.name);

            let snapshotCreated = await client.droplets.snapshot(droplet.id, slug);
            let output = {
                "droplet_name": droplet.id,
                "droplet_id": droplet.id,
                "action_id": snapshotCreated.id,
                "type": snapshotCreated.type,
                "status": snapshotCreated.status,
                "started_at": snapshotCreated.started_at
            }
            snapshotCreatedList.push(output);
        }
    }

    const csv = csvWriter.createObjectCsvWriter(
        {
            path: './var/snapshot_list.csv', header: [
                {id: 'droplet_name', title: 'droplet_name'},
                {id: 'droplet_id', title: 'droplet_id'},
                {id: 'action_id', title: 'action_id'},
                {id: 'type', title: 'type'},
            ]
        }
    );

    await csv.writeRecords(snapshotCreatedList).then(() => console.log('|-> SNAPSHOT list action saved on CSV!'));
}
