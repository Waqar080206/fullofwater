import mongoose from 'mongoose';
import Prediction from '../src/models/Prediction';
import Bet from '../src/models/Bet';
import User from '../src/models/User';
import Race from '../src/models/Race';

async function seedRealData() {
  try {
    await mongoose.connect('mongodb+srv://syedwaqarakhtar08_db_user:84MuKgbVaI73ZG3U@offgrid.t7yihza.mongodb.net/fullofwater');
    
    const race = await Race.findOne();
    if (!race) {
      console.log('No race found, cannot attach predictions.');
      process.exit(1);
    }

    console.log('Clearing old mocked predictions...');
    await Prediction.deleteMany({});
    
    // Create the specific questions requested by the user
    console.log('Creating new prediction pools...');
    const questions = [
      {
        question: 'Will there be a Safety Car before Lap 10?',
        optionA: 'Yes',
        optionB: 'No'
      },
      {
        question: 'Who will qualify on Pole Position?',
        optionA: 'Max Verstappen',
        optionB: 'Any other driver'
      },
      {
        question: 'Will both Ferraris finish in the Top 5?',
        optionA: 'Yes',
        optionB: 'No'
      }
    ];

    const predictions = await Promise.all(questions.map(q => 
      Prediction.create({
        raceId: race._id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        status: 'open',
        poolA: 0,
        poolB: 0
      })
    ));

    console.log('Generating simulated Web3 accounts and placing varying wagers...');
    const accounts = [];
    
    // Generate 25 fake overlapping accounts
    for (let i = 1; i <= 25; i++) {
       const w = `0xMockedWalletAssigned${i}`;
       let u = await User.findOne({ walletAddress: w });
       if (!u) {
          u = await User.create({ walletAddress: w, username: `DriverApe${i}`, nonce: `mock${i}`, gameCoins: 250000 });
       }
       accounts.push(u);
    }

    // Have accounts place dynamic, random bets 
    // to simulate a live market with asymmetrical pools
    // Prediction 1 leans slightly A
    // Prediction 2 leans heavily B
    // Prediction 3 leans slightly B
    const biasA = [0.6, 0.2, 0.45]; 

    for (let pIndex = 0; pIndex < predictions.length; pIndex++) {
        const p = predictions[pIndex];
        const bias = biasA[pIndex];
        
        let localPoolA = 0;
        let localPoolB = 0;

        for (const account of accounts) {
            // Not every account bets on every prediction (70% participation rate)
            if (Math.random() > 0.70) continue;

            const chosenOption = Math.random() < bias ? 'A' : 'B';
            // Variable stakes: some whales (5-20k), some retail (100-3000)
            const isWhale = Math.random() < 0.1;
            const amountStaked = isWhale ? 
                Math.floor(Math.random() * 15000) + 5000 : 
                Math.floor(Math.random() * 2900) + 100;

            await Bet.create({
                userId: account._id,
                predictionId: p._id,
                raceId: race._id,
                chosenOption,
                amountStaked
            });

            if (chosenOption === 'A') localPoolA += amountStaked;
            else localPoolB += amountStaked;
        }

        // Save pool totals directly to prediction
        p.poolA = localPoolA;
        p.poolB = localPoolB;
        await p.save();
        
        console.log(`- ${p.question}`);
        console.log(`  Pool A (${p.optionA}): ${localPoolA} GC | Pool B (${p.optionB}): ${localPoolB} GC`);
    }

    console.log('Successfully seeded database with realistic market behavior.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seedRealData();