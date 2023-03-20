export default () => ({
  Port: parseInt(process.env.PORT) || parseInt(process.env.Port),
  DatabaseUrl:
    process.env.DatabaseUrl ||
    'mongodb+srv://samuelbills:77045109@cluster0.nakki.mongodb.net/HMSTAN',
  Database: process.env.Database,
  SmsKey: process.env.SmsKey || 'SmbbUGIVjYL17ek434qt9ppWZ',
  SmsUrl: process.env.SmsUrl,
  SmsSender: process.env.SmsSender,
});
