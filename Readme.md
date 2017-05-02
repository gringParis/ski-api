# ski-api

a simple api allowing to retreive data from a json containing data related to ski slopes.

## install

1. get the source code
2. run the following command to install node dependencies
```sh
  npm install
```

## use

use the following command to start your server
```sh
  npm start
```
you can now query your local local server at the following uri : http://localhost:3000

# endpoints

there are 2 endpoints. the first is /off-pistes

## /off-pistes
it allow to display all or filter slopes.
you can pass 2 parameters: 

### query:
the query parameter allow you to filters the slopes. the query is composed of 3 elements, an attribut name, an operator and a value.
let's see 2 exemples of queries
1. query=name.like(*couloir*)
it allows to search slopes where the name is like couloir ( its like an sql like. so here it means a name containing the word "couloir. Its case insensitive.
2. query=ski_difficulty=2
it allows to search the slopes having a ski difficulties equals to 2.

Only those 2 operators are available at the moment.

### sort:
the sort parameter allow you to sort on an attribute. give the attribute name to sort on this attribute. default sort is ascending for descending sort, you pass -attrName.
exemples:
sort=-name will perform a descending sort by name 
sort=id will perform a ascending sort by id 


### puting all together
http://localhost:3000/off-pistes?query=name.like(*couloir*)&sort=-name
http://localhost:3000/off-pistes?query=ski_difficulty=2

the second endpoint is /off-piste

## /off-piste
it require an id parameter. It return a piece of html representing the slope in 3 dimensions in a 600px * 600px canevas.
It is based on threejs.
You can make the slope rotate by left clicking in the canevas.
You can translate the slope with the right click.
You can zoom in and out with your mouth wheal.
Those controls come from OrbitControls.js which a threejs extention
The canevas is responsive in the sense that if the window dimensions are more little than 600x600, the canevas takes window width/ height
exemple:
http://localhost:3000/off-piste?id=6216


##errors
if an error occures, it will be sent with apporpiate status
there are 3 errors defined
1. invalid query. Unrecognized operator: the operator in the query parameter has not been recognized...
2. invalid query. There a more than one = sign. 
3. internal error


### possible ameliorations
to pass the returned fields as a parameter would have been easy to do, and would have been a good thing imo.
i could have added easily pagination parameters
i could have used jade to render the canevas
i could have splitted a little more the code in app.js