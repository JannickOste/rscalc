import { AppDataSource } from "../data-source";
import { MoneyMakingMethod } from "../db/money-making-method";


export default class index 
{
    private static getMoneyMakingMethods = async() => 
    {        
        let methods = [];
        for(let method of  await AppDataSource.manager.find(MoneyMakingMethod))
        {
            let parsedObject = Object.assign({}, method);
            for(let getterName of Object.keys(parsedObject).filter((i => i.startsWith("get"))))
            {
                if(parsedObject[getterName] instanceof Function)
                    parsedObject[getterName.substring(3).toLowerCase()] = await parsedObject[getterName]();
                console.log(getterName);
            }
            methods.push(parsedObject);
        }
        
        return methods;
    }

    static get = async(req, res) =>  res.render("index", {methods: await this.getMoneyMakingMethods()});
    
}