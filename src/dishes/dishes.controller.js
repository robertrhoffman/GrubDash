const path = require("path");


// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list (req, res) {
    res.json({data: dishes})
}

const dishExists = (req, res, next) => {
    const {dishId} = req.params
    const foundDish = dishes.find((dish) => dish.id == dishId);
    if(foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({ status:404, message: `Dish ID does not exist: ${dishId}`});
};


function create (req, res, next) {
    const {data:{name, description, price, image_url} = {} } = req.body
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price: price,
        image_url: image_url,
    }

    if (!name) {
        return next({
            status: 400,
            message:"Must include a name."
        })
    }
    if (!description) {
        return next({
            status: 400,
            message: `description is empty ${req.params.orderId}.`
        });
    }
    if (!image_url) {
        return next({
            status: 400,
            message: `image_url is empty ${req.params.orderId}.`
        });
    }
    if (!price || isNaN(price) || price <= 0 || typeof price !="number") {
        return next ({
            status: 400,
            message:`Dish must include a price ${price}`
        })
    }

    dishes.push(newDish)
    res.status(201).json({data:newDish})
}


function read (req, res, next) {
    const { dishId } = req.params
    const findDish = dishes.find(dish => dish.id === (dishId))
    res.json ({data: findDish})
}

function update (req, res, next) {
    const { dishId } = req.params
    const dish = dishes.find(dish => dish.id === (dishId))
    const {data:{id, name, description, price, image_url} = {} } = req.body

    if (!name) {
        return next({
            status: 400,
            message:`name is empty ${req.params.orderId}.`
        })
    }
    if (!description) {
        return next({
            status: 400,
            message: `description is empty ${req.params.orderId}.`
        });
    }
    if (!image_url) {
        return next({
            status: 400,
            message: `image_url is empty ${req.params.orderId}.`
        });
    }
    if (!price || isNaN(price) || price <= 0 || typeof price !="number") {
        return next ({
            status: 400,
            message:`price ${price}.`
        })
    }
    if (id && id != dishId) {
       return next({
            status: 400,
            message: `Dish id does not exist: ${dishId} ${id}.`
       }) 
    }
    

    dish.name = name 
    dish.description = description
    dish.price = price
    dish.image_url = image_url
    res.json({data:dish})
}


module.exports = {
    create, 
    list, 
    read:[dishExists, read], 
    update:[dishExists, update]
}
