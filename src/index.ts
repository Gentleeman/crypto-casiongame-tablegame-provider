import 'dotenv/config';
import 'regenerator-runtime';
import * as cors from 'cors';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as useragent from 'express-useragent';
import * as methodOverride from 'method-override';
import rateLimit from 'express-rate-limit';
import routes2 from './routes2';
import sequelize from './db';

const app = express();

app.use(compression());
app.use(useragent.express());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
app.use(bodyParser.text({ type: 'text/html' }));
app.use(methodOverride());

app.use(cors('*' as cors.CorsOptions));
app.use(express.json());

sequelize.sync().then(() => {
    console.log('Database & tables created!');
});

const apiV2Limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/v2/', apiV2Limiter, routes2);

// Start the server
app.listen(parseInt(process.env.PORT || '8080'), `0.0.0.0`, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
