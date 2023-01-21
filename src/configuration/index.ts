export default () => ({
  Port: parseInt(process.env.PORT) || parseInt(process.env.Port),
  DatabaseUrl: process.env.DatabaseUrl,
  Database: process.env.Database,
  SmsKey: process.env.SmsKey,
  SmsUrl: process.env.SmsUrl,
  SmsSender: process.env.SmsSender,
});
