import express from 'express'
import bodyParser from 'body-parser'
import logger from "./logger"
import Logic from "./logic"
//import cors from "cors"

//api logic
var logic  = new Logic()

//server init
let app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.static(__dirname + '/../public'))
logger.debug(__dirname)
app.listen(3000, function () {
  logger.debug('app listening on port 3000!');
});


//routes
/**
* off-pistes allow to query slopes. Parameters are optionals
* query (allow to filter off-pistes) 2  possible operators
* 	attrName=attrValue to express a equality
* 	attrName.like(*attrValue*) to express like operation
* sort
*	give the attribute name to sort on this attribute. default sort is asc
*	for desc sort, you pass -attrName
*/
app.get('/off-pistes', (req, res)=>{
	logger.debug(req.query)
	let errors = []

	let sortName = req.query.sort
	let sortAsc = null
	if(sortName && sortName.indexOf("-") == 0)
	{
		sortAsc = false
		sortName = sortName.substring(1, sortName.length)
	}else if(sortName){
		sortAsc = true
	}
	//build parameters required by the logic.search
	let filterQuery = req.query.query
	let [filterName, filterOperator, filterValue] = [null, null, null]
	if(filterQuery)
	{	//there is a query
		const likeMatches = filterQuery.match(/.*\.like\(.*\)/g)
		if(filterQuery.indexOf("=") >= 0)
		{//equality operator
			filterOperator = "eq"
			let splittedQ = filterQuery.split("=")
			if(splittedQ.length == 2)
			{
				filterName = splittedQ[0]
				filterValue = splittedQ[1]
			}else{
				errors.push({
				    "message": "invalid query. There a more than one = sign",
				    "code": 2
				})
			}
			
		}else if(likeMatches.length == 1)
		{//like operator
			let splittedQ = likeMatches[0].split('.')
			logger.debug(splittedQ)
			filterName = splittedQ.shift()
			filterOperator = "like"
			let joined = splittedQ.join('.')
			filterValue = joined.replace("like(", "").substring(0, joined.length - 6)
			logger.debug(filterValue)
		}else{
			errors.push({
			    "message": "invalid query. Unrecognized operator",
			    "code": 1
			})
		}
	}
	if(errors.length)
	{//we send a status error code with the errors
		res.status(400).send({errors})
	}else{
		logger.debug(filterName+ " " + filterOperator + " " +filterValue+ " " + sortName+ " " + sortAsc)
		try{
			let data = logic.search(filterName, filterOperator ,filterValue, sortName, sortAsc)
			if(data.length)
				res.send({data})
			else{
				errors.push({
				    "message": "no result found",
				    "code": 4
				})
				res.send({errors})
			}
		}catch(e){
			errors.push({
			    "message": "internal error",
			    "code": 3
			})
			logger.error(e)
			res.status(500).send({errors})
		}
	}
})


/**
*end point for canevas. It require a parameter id to be passed
*/
	app.get("/off-piste",( req, res )=>{
		let errors = []
		let id = req.query.id
		const data = logic.get(id)
		if(data)
		{
			//res.send({data})
			let myPage = '<div id="threeJsContainer"></div>' 
			myPage += '<script type="text/javascript"> window.slopeData=' + JSON.stringify(data) + ';</script>'
			myPage +='<script src="three.js"></script>'
			myPage +='<script src="OrbitControls.js"></script><script src="dat.gui.min.js"></script>'
			myPage +='<script type="text/javascript" src="canevas.js" defer></script>'
			res.send(myPage)
		}else{
			res.send({"data":[]})
		}
	})


//



