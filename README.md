
# Smartcar - Experience Team - Back-End Coding Challenge

Your local car sharing company is looking to create an application that can help them manage the vehicles and the customers who rent the vehicles. Their application will need to be able to do the following:
1. Create and get a vehicle, driver and trip
2. Return a list of active vehicles on the road and their driver


## Install

    npm install

## Run the app

    npm start

## Run unit and integration tests

    npm test

## API Reference

#### Get vehicle

`GET /vehicles/${id}`

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of vehicle to fetch |

#### Get driver

`GET /drivers/${id}`

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of driver to fetch |

#### Get trip

`GET /trips/${id}`

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of trip to fetch |

#### Filter trips *(Pass filters using query parameters in URL)*

`GET /trips/?status=active|inactive`

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `status`      | `int` | Filter by status of trip |
| `startedAt`      | `date` | Filter by startedAt of trip |
| `expectedReturn`      | `date` | Filter by expectedReturn of trip |

`POST /vehicles`

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `make` | `string` | **Required**. Make of the car to be created |

`POST /drivers`

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `driverName` | `string` | **Required**. Name of the driver to be created |

`POST /trips`

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `driverId` | `int` | **Required**. Id of driver assigned to trip |
| `vehicleId` | `int` | **Required**. Id of vehicle assigned to trip |
| `startedAt` | `date` | **Required**. Start time of trip |
| `expectedReturn` | `date` | **Required**. Expected return of vehicle |
| `status` | `string` | Current status of trip (active or inactive) |

`PUT /trips`

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `tripId` | `int` | **Required**. Id of trip to be updated |
| `startedAt` | `date` | Start time of trip |
| `expectedReturn` | `date` | Expected return of vehicle |
| `status` | `string` | Current status of trip (active or inactive) |

#### Delete vehicle

`GET /vehicles/${id}`

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of vehicle to delete |


#### Delete driver

`GET /drivers/${id}`

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of driver to delete |

#### Delete trip

`GET /trips/${id}`

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `int` | **Required**. Id of trip to delete |

## Usage/Examples

***POST /vehicles***

*Request*
```javascript
{
    make: "Honda",
}
```

*Response*
```javascript

{
    id: 1,
    make: "Honda",
}
```
***GET /vehicles/1***

*Response*
```javascript
{
    id: 1,
    make: "Honda",
}
```

***POST /drivers***

*Request*
```javascript
{
    driverName: "John Doe",
}
```

*Response*
```javascript

{
    id: 1,
    driverName: "John Doe",
}
```
***GET /driver/1***

*Response*
```javascript
{
    id: 1,
    driverName: "John Doe",
}
```

***POST /trips***

*Request*
```javascript
{

    vehicleId: 1,
    driverId: 1,
    startedAt: "2022-02-24T14:43:18-08:00",
    expectedReturn: "2022-03-24T14:43:18-08:00",
}
```

*Response*
```javascript

{
    id: 1,
    startedAt: "2022-02-24T14:43:18-08:00",
    expectedReturn: "2022-03-24T14:43:18-08:00",
    status: "active",
    driver: {
        driverId: 1,
        driverName: "John Doe",
    },
    vehicle: {
        vehicleId: 1,
        make: "Honda",
    },
}
```
***GET /trips/1***

*Response*
```javascript
{
    id: 1,
    startedAt: "2022-02-24T14:43:18-08:00",
    expectedReturn: "2022-03-24T14:43:18-08:00",
    status: "active",
    driver: {
        driverId: 1,
        driverName: "John Doe",
    },
    vehicle: {
        vehicleId: 1,
        make: "Honda",
    },
}
```

***PUT /trips***

*Request*
```javascript
{

    tripId: 1,
    status: "inactive"
}
```

*Response*
```javascript

{
    id: 1,
    startedAt: "2022-02-24T14:43:18-08:00",
    expectedReturn: "2022-03-24T14:43:18-08:00",
    status: "inactive",
    driver: {
        driverId: 1,
        driverName: "John Doe",
    },
    vehicle: {
        vehicleId: 1,
        make: "Honda",
    },
}
```



