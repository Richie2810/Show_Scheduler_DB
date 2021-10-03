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

  fanSchema.method("hasPerformance", function (performanceId) {
    const scheduledPerformances = this.performances;
    if (scheduledPerformances.contains(performanceId)) {
      return true;
    } else {
      return false;
    }
  });

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
  // queen.save()

  const Richie = new Fan({
    name: "Richie",
    performances: ["615301266d4b6f838a9d32b1"],
  });

  // Richie.save()

  app.get("/allPerformances", async (req, res) => {
    try {
      const allPerformances = await Performance.find();
      return res.status(200).send(allPerformances);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  app.post("/addPerformance", async (req, res) => {
    try {
      const { title, description, start_date, end_date } = req.body;

      const newPerformance = new Performance({
        title,
        description,
        start_date,
        end_date,
      });
      newPerformance.save();
      const allPerformances = await Performance.find();
      console.log(allPerformances);
      return res.status(200).send(allPerformances);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  app.post("/removePerformance", async (req, res) => {
    try {
      console.log(typeof req.body.performance);
      await Performance.deleteOne({ title: req.body.performance });
      const allPerformances = await Performance.find();
      return res.status(200).send(allPerformances);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  app.post("/newFan", async (req, res) => {
    try {
      const fan = await Fan.find({ name: req.body.name });
      if (fan.length === 0) {
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

  app.post("/mySchedule", async (req, res) => {
    try {
      const performancesOfUser = await Fan.find({
        name: req.body.name,
      }).populate("performances");
      return res.status(200).send(performancesOfUser[0].performances);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  app.patch("/addToSchedule", async (req, res) => {
    try {
      const isScheduled = await Fan.find({
        name: req.body.name,
        performances: req.body.performance,
      });
      console.log(isScheduled);
      if (isScheduled.length === 0) {
        const updateFan = await Fan.updateOne(
          { name: req.body.name },
          { $push: { performances: req.body.performance } }
        );
      }
      const fan = await Fan.find({ name: req.body.name });
      return res.status(200).send(fan);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  app.patch("/removeSchedule", async (req, res) => {
    try {
      const updateFan = await Fan.updateOne(
        { name: req.body.name },
        {
          $pull: { performances: req.body.performance },
        }
      );
      const fan = await Fan.find({ name: req.body.name });
      return res.status(200).send(fan);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });
  //console.log(queen)
  app.post("/15MinuteCall", async (req, res) => {
    try {
      const performancesOfUser = await Fan.find({
        name: req.body.name,
      }).populate("performances");
      return res.status(200).send(performancesOfUser);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  //This checks for a show that is past its end Date than deletes it from the DB
  app.delete("/showsOver", async (req, res) => {
    try {
      const allPerformances = await Performance.find();
      allPerformances.map(async (perf) => {
        if (new Date(perf.end_date).getTime() < new Date().getTime()) {
          console.log("Show is over");
          const deletePerformance = await Performance.deleteOne({
            title: perf.title,
          });
        }
      });
      const allInDatePerformances = await Performance.find();
      return res.status(200).send(allInDatePerformances);
    } catch (e) {
      console.log(e.message);
      return res.status(400).send("Database down || bad request");
    }
  });

  app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
  });
}
