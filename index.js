const express = require('express');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 3000;
const app = express();

// middlewares
app.use(cors(
  {
    origin: ['http://localhost:5173'],
  }
));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5yhhqym.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const db = client.db("airbnb");
const coll = db.collection("destinations");

async function run() {
    try {
        await client.connect();

        app.get('/', async (req, res) => {
            res.send('Welcome to airbnb');
          });

        app.get('/destinations', async (req, res) => {
            let result;
            const query = {};
            const category = req.query?.category;
            const type = req.query?.type;
            const min_price = parseInt(req.query?.min_price);
            const max_price = parseInt(req.query?.max_price);
            const duration = parseInt(req.query?.duration);
            const guests = parseInt(req.query?.guests);
            const booking_options = req.query?.booking_options;
            const essentials = req.query?.essentials;
            const search = req.query?.search;
            if (category) {
                query.category = category;
            }
            if (type) {
                query.type = type;
            }
            if (min_price) {
                if (query.total_price) {
                    query.total_price.$gte = min_price;
                } else {
                    query.total_price = {
                        $gte: min_price
                    };
                }
            }
            if (max_price) {
                if (query.total_price) {
                    query.total_price.$lte = max_price;
                } else {
                    query.total_price = {
                        $lte: max_price
                    };
                }
            }
            if (duration && duration > 0) {
                query.duration = duration;
            }
            if (guests) {
                if (query.no_of_guests) {
                    query.no_of_guests.$gte = guests;
                } else {
                    query.no_of_guests = {
                        $gte: guests
                    };
                }
            }
            if (booking_options) {
                query.booking_options = booking_options;
            }
            if(essentials && essentials !== '[]') {
                const newEssentials = essentials.slice(1, -1);
                const essentialsArray = newEssentials.split(',');
                for (let i in essentialsArray) {
                    let element = essentialsArray[i].slice(1, -1);
                    essentialsArray[i] = element;
                }
                query.essentials = {
                    $in: essentialsArray
                };
            }
            result = await coll.find(query).toArray();
            if(search) {
                const newResult = result.filter(destination => destination.location.toLowerCase().includes(search.toLocaleLowerCase()));
                return res.json(newResult);
            }
            res.json(result);
        });
    } catch (error) {
        console.dir(error);
    }
}

run();

app.listen(port);