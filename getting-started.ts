import { Schema, model, connect } from "mongoose";
import express from "express";
const PORT = 4001;

const app = express();

const cors = require("cors");
app.use(cors());

app.use(express.json());

main().catch((err) => console.log(err));

interface Performance {
  title: string;
  start_date: Date;
  end_date: Date;
  description: string;
  status: string;
}

interface Fan {
  name: string;
  performances: [
    {
      type: Schema.Types.ObjectId;
      ref: String;
    }
  ];
}

async function main() {
  await connect(
    "mongodb+srv://Richie:richie281090@show-scheduler.y9axf.mongodb.net/Show-Scheduler?retryWrites=true&w=majority"
  );

  const performanceSchema = new Schema<Performance>({
    title: { type: String, required: true, unique: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    description: { type: String, required: true },
  });

  const fanSchema = new Schema<Fan>({
    name: { type: String, required: true, unique: true },
    performances: [
      {
        type: Schema.Types.ObjectId,
        ref: "Performance",
      },
    ],
  });

  // performanceSchema.methods. = function speak() {
  //     const greeting = this.title
  //       ? "Meow name is " + this.title
  //       : "I don't have a name";
  //     console.log(greeting);
  //   };
  const Fan = model<Fan>("Fan", fanSchema);

  const Performance = model<Performance>("Performance", performanceSchema);

  // const queen = new Performance({
  //   title: "Queen",
  //   start_date: "2021-09-28T14:00:00.000",
  //   end_date:"2021-09-28T15:00:00.000",
  //   description:"Massive UK base Rock band"
  // })
  // const greenday = new Performance({
  //   title: "greenday",
  //   start_date: "2021-09-28T17:00:00.000",
  //   end_date: "2021-09-28T20:00:00.000",
  //   description: "Famous song is American Idiot",
  // });

  // greenday.save();

  const Richie = new Fan({
    name: "Richie",
    performances: ["615301266d4b6f838a9d32b1"],
  });

  // Richie.save()

  app.get("/allPerformances", async (req, res) => {
    try {
      console.log("A request was made for all performances");
      const allPerformances = await Performance.find();
      console.log(allPerformances);
      return res.status(200).send(allPerformances);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  app.post("/addPerformance", async (req, res) => {
    try {
      const { title, start_date, end_date, description } = req.body;
      const newPerformance = new Performance({
        title,
        start_date,
        end_date,
        description,
        status: "green",
      });
      newPerformance.save();
      return res.status(200).send("successful");
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  app.post("/newFan", async (req, res) => {
    const { name } = req.body;
    console.log(name);

    try {
      const fan = await Fan.find({ name: req.body.name });
      console.log(fan);
      if (fan.length === 0) {
        console.log("length is 0");
        const newFan = new Fan({
          name: req.body.name,
          performances: [],
        });
        newFan.save();
        return res.status(200).send(newFan);
      } else {
        return res.status(200).send(fan);
      }
    } catch (e) {
      console.log(e.message);
      res.status(400).send("Database down || bad request");
    }
  });

  app.get("/mySchedule", async (req, res) => {
    try {
      const performancesOfUser = await Fan.find({
        name: req.body.name,
      }).populate("performance");
      return res.status(200).json(performancesOfUser);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  app.patch("/addToSchedule", async (req, res) => {
    try {
      const fanPerformances = await Fan.find({
        name: req.body.name,
      });
      const fan = await Fan.findOneAndUpdate(
        { name: req.body.name },
        { performances: [...fanPerformances, req.body.performance] }
      );
      fan.save();
      return res.status(200).send(fan);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });
  //console.log(queen)
  app.get("/15MinuteCall", async (req, res) => {
    try {
      const fan = await Fan.find({ name: req.body.name });
      for (let perf in fan) {
        const performance = await Performance.findById(perf);
        if (
          new Date(performance.start_date).getTime() <
            new Date().getTime() - 900000 &&
          performance.status === "green"
        ) {
          res.status(400).send(true);
          await Performance.updateOne(Performance, { status: "red" });
        }
      }
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  //Need to change this to perf.end_date and perf.title
  app.get("/showsOver", async (req, res) => {
    try {
      const allPerformances = await Performance.find();
      for (let perf in allPerformances) {
        if (new Date(perf).getTime() < new Date().getDate()) {
          Performance.deleteOne({ title: perf });
        }
      }
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
  });
}
