import client from './client.js'

const copyRegion = process.env.DO_REGION_COPY || 'ams2';

export async function copySnapshot() {
    console.log('|-> REGION TO COPY: ' + copyRegion);

    let snapshotList = await client.images.list({
        private: true
    });

    for (const snapshot of snapshotList) {
        let response = await client.images.action(
            snapshot.id,
            {
                "type": "transfer",
                "region": copyRegion
            }
        ).catch(
            function (error) {
                console.log('|-> '+snapshot.name+': '+error.body.message);
                console.log("---------------------------------------------------------");
            }
        );

        if (response) {
            let output = {
                'snapshot_id': snapshot.id,
                'status': response.status,
                'action': response.type
            }

            console.log(output);
            console.log("---------------------------------------------------------");
        }
    }
}
