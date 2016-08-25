var NutrientRatio = function(proteins, carbs, fats) {
    //So we get our calories ONLY (which is computed
    //via the BMI or whatever, pass taht into this.
    if(arguments.length === 2){
        //So at this point we should say "Is the
        //person bodybuilding? or is he/she trying
        //to lose weight? or trying to mantain: depending
        //on this we then use the multiplication formula
        //(found on Google) and modify it slightly: more
        //protein and fat for body builders, less fat 
        //and carbohydrates for people trying to lose weight:
        //that means that we'd have to question the actual
        //condition of the persons diet type and choose 
        //our multipliers accordingly. From this we
        //can can protein, carbs, and fat and then use
        //them however we wish.
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
