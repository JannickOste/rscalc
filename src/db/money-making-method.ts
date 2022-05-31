import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import grandExchange from "../api/grand-exchange";
import Skill from "../enums/skill";
import IItem from "../interfaces/IItem";

@Entity()
export class MoneyMakingMethod 
{
    private static itemCache = {};

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    inputItems: string

    @Column()
    outputItems: string

    @Column()
    requirements: string

    getInvestment = async () => await this.calculateCost(JSON.parse(this.inputItems));
    getReturn = async () => await this.calculateCost(JSON.parse(this.outputItems));
    getRequirements = () => 
    {
        let parsedRequirements = JSON.parse(this.requirements);
        for(let id in parsedRequirements)
        {

            parsedRequirements[id]["name"] = Skill[parsedRequirements[id].id];

        }
        console.log(parsedRequirements);
        return parsedRequirements;
    }
    return: number

    private async calculateCost(input: IItem[]) 
    {
        let cost = 0;
        for(let item of input)
        {
            if(!Object.keys(MoneyMakingMethod.itemCache).includes(`${item.id}`))
                MoneyMakingMethod.itemCache[`${item.id}`] = await grandExchange.getItemById(item.id);

            cost += (MoneyMakingMethod.itemCache[`${item.id}`].price.current * item.amount);
        }

        return cost;
    }
}