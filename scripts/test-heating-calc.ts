import { calculateHeatingTime } from '../lib/heating-calc';

const runTest = () => {
    console.log("Running Heating Calculation Test...");

    // User's example: 30,000 L, 50,000 BTU, Delta 8°C (22 -> 30), Inefficiency 1.2
    const volume = 30000;
    const currentTemp = 22;
    const targetTemp = 30;
    const powerBTU = 50000;
    const inefficiency = 1.2;

    const result = calculateHeatingTime(volume, currentTemp, targetTemp, powerBTU, inefficiency);

    console.log("Input:");
    console.log(`Volume: ${volume} L`);
    console.log(`Power: ${powerBTU} BTU`);
    console.log(`Delta: ${targetTemp - currentTemp}°C`);
    console.log(`Inefficiency: ${inefficiency}`);

    console.log("\nResult:");
    console.log(`Hours: ${result.hours}`);
    console.log(`Date: ${result.completionDate}`);
    console.log(`Valid: ${result.isValid}`);

    // Expected: ~22.8 hours
    if (result.hours >= 22.7 && result.hours <= 22.9) {
        console.log("\n✅ TEST PASSED: Result is within expected range (22.8h)");
    } else {
        console.error(`\n❌ TEST FAILED: Expected ~22.8h, got ${result.hours}h`);
    }
};

runTest();
