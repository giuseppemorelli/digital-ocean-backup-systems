import client from '../client.js';
import internal from "stream";

const copyRegion = process.env.DO_REGION_COPY || 'ams2';

export async function copySnapshot() {
    console.log('|-> REGION TO COPY: ' + copyRegion);

    const input = {
        per_page: 100,
        resource_type: undefined, // undefined || 'droplet' | 'volume'
    };
    let snapshotList = await client.snapshot.listSnapshots(input);

    for (const snapshot of snapshotList.data.snapshots) {
        const input = {
            image_id: Number.parseInt(snapshot.id),
            region: copyRegion
        };

        const response = await client.image.transferImage(input)
            .catch(
                function (error: any) {
                    console.log('|-> ' + snapshot.name + ': ' + error.response.data.message);
                    console.log("---------------------------------------------------------");
                }
            );

        if (response) {
            let output = {
                'snapshot_id': snapshot.id,
                'status': response.status,
                'action': response.data.action
            }

            console.log(output);
            console.log("---------------------------------------------------------");
        }
    }
}
