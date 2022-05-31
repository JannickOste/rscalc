import { AppDataSource } from "./data-source"
import { MoneyMakingMethod } from "./db/money-making-method";
import IItem from "./interfaces/IItem";
import Exchange from 'osrs-exchange';
import highscore from "./api/highscore";
import path = require("path");
import Skill from "./enums/skill";
import npcs from "./api/npcs";


class App 
{
    private static readonly express = require("express");
    private static webserver = this.express();
    private static glob = require("glob");
    private static fs =  require("fs");

    public static init = async() => 
    {
        await AppDataSource.initialize();

        // Initialize configuration.
        this.webserver.set("port", 80);
        this.webserver.use(this.express.urlencoded({extended: true}));
        this.webserver.set("view engine", "ejs");
        this.webserver.set("page handler directory", "./src/pages/");
        this.glob("./src/pages/**/*.ts", (err, files) => 
        {
            const callbackHandlers = files.map(i => i.replace(this.webserver.get("page handler directory"), ""));
            for(let filepath of callbackHandlers)
            {
                let currentPath = this.webserver.settings.views;
                for(let slice of filepath.split("/"))
                {
                    currentPath = path.join(currentPath, slice.replace(/.ts$/, ".ejs"));
                    if(this.fs.existsSync(currentPath))
                    {
                        if(slice.endsWith(".ts"))
                            import(path.join(this.webserver.get("page handler directory").replace(/^./, process.env.PWD), filepath)).then(callbackInterface =>{
                                for(let [key, value] of Object.entries(callbackInterface.default))
                                {
                                    switch(key)
                                    {
                                        case "get": this.webserver.get(`/${filepath.replace(/.ts$/, "").replace("index", "")}`, value);
                                    }
                                }
                            });
                    }
                }
            }                   
        });


        this.webserver.get("/removeMethod/:id", async(req, res) => {
            let message = "";
            const item = await AppDataSource.manager.findOne(MoneyMakingMethod, {where: {id: Number.parseInt(req.params.id)}});
            if(item)
            {
                await AppDataSource.manager.remove(item);
                message = "Item succesfully removed";
            } else message = "failed to remove item";

            return res.render("message", {message: message});
        });

        this.webserver.get("/addMethod", async(req, res) => {
            console.log();
            return res.render("addMethod", {skills: Array.from({length: Skill.Construction}, (val, key) => key+1).map(i => Skill[i])});
        });
    }

    
    public static main = async() => 
    {
        await this.init();
        await this.test();
        console.log(await npcs.getBeast(1))

        this.webserver.listen(this.webserver.get("port"), () => console.log("Listening for requests on: http://127.0.0.1:"+this.webserver.get("port")+"/"))
    }

    public static test = async() =>
    {
        if((await AppDataSource.manager.find(MoneyMakingMethod)).length == 0)
        {
            const user = new MoneyMakingMethod();
            user.name = "Spinning flax"
            user.inputItems = JSON.stringify( [
                {
                    id: 1779, 
                    amount: 1400
                }
            ]);
            user.outputItems = JSON.stringify( [
                {
                    id: 1777, 
                    amount: 1400
                }
            ]);

            user.requirements = JSON.stringify( [
                {
                    id: 1, 
                    requirement: 10
                }
            ]);

            await AppDataSource.manager.save(user)
        }
    }
}

App.main();

