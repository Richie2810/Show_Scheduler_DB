import { Schema, model, connect} from 'mongoose';
import express from "express"
const PORT = 4000

const app = express()


main().catch(err => console.log(err));

interface Performance {
  title:string,
  start_date:Date,
  end_date:Date,
  description:string
}

interface Fan {
  name:string
  performances:[{
    type: Schema.Types.ObjectId,
    ref:String
  }]
}

async function main() {
  await connect('mongodb+srv://Richie:richie281090@show-scheduler.y9axf.mongodb.net/Show-Scheduler?retryWrites=true&w=majority');

  const performanceSchema = new Schema<Performance>({
      title: {type:String, required:true, unique:true},
      start_date: {type:Date, required:true},
      end_date: {type:Date, required:true},
      description: {type:String, required:true},
  });

  const fanSchema = new Schema<Fan>({
    name:{type:String, required:true, unique:true},
    performances:[{
      type: Schema.Types.ObjectId,
      ref:"Performance"
    }]
  })


  // performanceSchema.methods. = function speak() {
  //     const greeting = this.title
  //       ? "Meow name is " + this.title
  //       : "I don't have a name";
  //     console.log(greeting);
  //   };
  const Fan = model<Fan>('Fan', fanSchema)

  const Performance = model<Performance>('Performance', performanceSchema);

    // const queen = new Performance({
    //   title: "Queen",
    //   start_date: "2021-09-28T14:00:00.000",
    //   end_date:"2021-09-28T15:00:00.000",
    //   description:"Massive UK base Rock band"
    // })

    const Richie = new Fan (
      {
        name:"Richie",
        performances:["615301266d4b6f838a9d32b1"]
      },
    )

    // Richie.save()

    app.get('/allPerformances', async (req,res) => {
      try{
        const allPerformances = await Performance.find();
        return res.status(200).send(allPerformances)
      }catch(e){
        console.log(e.message)
        return res.status(400).send("Database down || bad request")
      }
    })

    app.post('/addPerformance', async (req,res) => {
      try{
        const {title, start_date, end_date, description} = req.body
        const newPerformance = new Performance({
          title,
          start_date,
          end_date,
          description
        })
        newPerformance.save()
        return res.status(200).send("successful")
      }catch(e){
        console.log(e.message)
        return res.status(400).send("Database down || bad request")
      }
    })

    app.post('/newFan', async (req,res) => {
      try {
        const newFan = new Fan({
        name:req.body.name,
        performances:[]
      })
    } catch(e){
      console.log(e.message)
      res.status(400).send("Database down || bad request")
    } 
    })

    app.get('/mySchedule', async (req,res) => {
      try{
        const performancesOfUser = await Fan.find({name:req.body.name}).populate("performance")
        return res.status(200).json(performancesOfUser)
      }catch(e){
        console.log(e.message)
        return res.status(400).send("Database down || bad request")
      }
    })

    app.patch('/addToSchedule', async (req,res) => {
      try{
        const performance = await Performance.find({title:req.body.title})
        const fan = await Fan.findOneAndUpdate({name:req.body.name},{Performances:performance})
        return res.status(200).send(fan)
      }catch(e){
        console.log(e.message)
        return res.status(400).send("Database down || bad request")
      }
    })
    //console.log(queen)

    app.listen(PORT, () => {
      console.log(`Listening on port: ${PORT}`);
    });

}