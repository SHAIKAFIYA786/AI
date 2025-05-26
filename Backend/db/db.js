// import mongoose from "mongoose";


// function connect() {
//     mongoose.connect(process.env.MONGODB_URI)
//         .then(() => {
//             console.log("Connected to MongoDB");
//         })
//         .catch(err => {
//             console.log(err);
//         })
// }

// export default connect;
// db/db.js
import mongoose from "mongoose";

function connectdb() {
  const dbURL =
    process.env.NODE_ENV === "production"
      ? process.env.PROD_DB_URI
      : process.env.LOCAL_DB_URI;

  console.log(`Connecting to ${process.env.NODE_ENV === 'production' ? 'MongoDB Atlas' : 'local MongoDB'}...`);

  mongoose
    .connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("✅ Connected to DB"))
    .catch((err) => console.error("❌ Error connecting to DB:", err));
}

export default connectdb;
