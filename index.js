const express = require('express');
const cors = require('cors');
const userRouter = require('./routers/user');
const allegationRouter = require('./routers/allegations');
const departmentsRouter = require('./routers/departments');
const dashboardRouter = require('./routers/dashboard');

const app = express();
const port = process.env.PORT || 3030;

app.use(express.json());
app.use(cors());
app.use(userRouter);
app.use(allegationRouter);
app.use(departmentsRouter);
app.use(dashboardRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
