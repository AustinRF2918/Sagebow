// This must be redone as a model.
var NutrientRatio = function(proteins, carbs, fats) {
    if(arguments.length === 2){
        this.calories = arguments[0];
        console.log(this.calories);
        switch(arguments[1]){
            case "Weight Loss":
                this.proteins = this.calories*0.55;
                this.carbs = this.calories*0.20;
                this.fats = this.calories*0.25;
                break;
            case "Toning":
                this.proteins = this.calories*0.45;
                this.carbs = this.calories*0.25;
                this.fats = this.calories*0.30;
                break;
            case "Bodybuilding":
                this.proteins = this.calories*0.30;
                this.carbs = this.calories*0.20;
                this.fats = this.calories*0.50;
                break;
        }
    }else{
        this.proteins = proteins;
        this.carbs = carbs;
        this.fats = fats;
        this.calories = proteins*4 + carbs*4 + fats*9;
    }
};
