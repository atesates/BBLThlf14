/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MedicineTransfer extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const medicines = [
            {
                name: 'Aspirin',
                value: '10',
                numberOf: '100',
                owner: 'Pharmacy1',
                expirationDate: '01.01.2023',
                issueDate: '01.01.2021',
                status: 'on supply',
                supplier: 'Pharmacy1',
                demander: 'null'

            },
            {
                name: 'Augmentin',
                value: '15',
                numberOf: '150',
                owner: 'Pharmacy2',
                expirationDate: '01.01.2023',
                issueDate: '01.01.2021',
                status: 'on supply',
                supplier: 'Pharmacy2',
                demander: 'null'
            },
          
        
        ];

        for (let i = 0; i < medicines.length; i++) {
            medicines[i].docType = 'medicine';
            await ctx.stub.putState('MEDICINE' + i, Buffer.from(JSON.stringify(medicines[i])));
            console.info('Added <--> ', medicines[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryMedicines(ctx, medicineNumber) {
        const medicineAsBytes = await ctx.stub.getState(medicineNumber); // get the medicine from chaincode state
        if (!medicineAsBytes || medicineAsBytes.length === 0) {
            throw new Error(`${medicineNumber} does not exist`);
        }
        console.log(medicineAsBytes.toString());
        return medicineAsBytes.toString();
    }

    async createMedicine(ctx, medicineNumber, name, value,
        numberOf,
        owner,
        expirationDate,
        issueDate,
        status,
        supplier,
        demander) {
        console.info('============= START : Create Medicines ===========');

        const medicine = {
            name,
            docType: 'medicine',
            value,
            numberOf,
            owner,
            expirationDate,
            issueDate,
            status,
            supplier,
            demander
        };

        await ctx.stub.putState(medicineNumber, Buffer.from(JSON.stringify(medicine)));
        console.info('============= END : Create Medicines ===========');
    }

    async queryAllMedicines(ctx) {
        const startKey = 'MEDICINE0';
        const endKey = 'MEDICINE9999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async changeMedicinesOwner(ctx, medicineNumber, newOwner) {
        console.info('============= START : changeMedicinesOwner ===========');

        const medicineAsBytes = await ctx.stub.getState(medicineNumber); // get the medicine from chaincode state
        if (!medicineAsBytes || medicineAsBytes.length === 0) {
            throw new Error(`${medicineNumber} does not exist`);
        }
        const medicine = JSON.parse(medicineAsBytes.toString());
        medicine.owner = newOwner;

        await ctx.stub.putState(medicineNumber, Buffer.from(JSON.stringify(medicine)));
        console.info('============= END : changeMedicinesOwner ===========');
    }
    async deleteMedicine(ctx, medicineNumber) {
        console.info('============= START : changeMedicinesOwner ===========');

        const medicineAsBytes = await ctx.stub.getState(medicineNumber); // get the medicine from chaincode state
        if (!medicineAsBytes || medicineAsBytes.length === 0) {
            throw new Error(`${medicineNumber} does not exist`);
        }
        const medicine = JSON.parse(medicineAsBytes.toString());

        await ctx.stub.deleteState(medicineNumber)
        console.info('============= END : deleteMedicine ===========');
    }
}

module.exports = MedicineTransfer;