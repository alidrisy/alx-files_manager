import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import bodyParser from 'body-parser';

const routes = express.Router();
routes.use(bodyParser.json());

routes.get('/status', AppController.getStatus);
routes.get('/stats', AppController.getStats);
routes.post('/users', UsersController.postNew);

export default routes;
