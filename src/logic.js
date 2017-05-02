import logger from "./logger"

export default class Logic {

	constructor()
	{
		this.items = require("../off-pistes.json")
		this.filterEqual = this.filterEqual.bind(this)
		this.filterLike = this.filterLike.bind(this)
		this.search = this.search.bind(this)
		// the attributs that we will return througth search
		this.config = {
			"returnedAttrs":["id", "name", "description", "ski_difficulty"]
		}

		//logger.debug(this.items[0])
		//logger.debug(this.search("id", "eq", 9514))
		/*logger.debug(this.search("name", "like", "*couloir*", "id", true))	*/
		/*var test = this.items.filter((elem)=>{ return (elem.geo_data != null) }).filter((elem)=>{ return (elem.geo_data.coordinates.length >1) }).map((elem)=>{return elem.id})
		logger.debug(test)*/
	}
	/**
	*	equality operator
	*/
	filterEqual(elem, filterName, filterValue )
	{
		if(elem[filterName] == filterValue)
		{
			return true
		}else{
			return false
		}
	}
	/**
	*like operator
	*/
	filterLike(elem, filterName, filterValue, regex )
	{
		return regex.test(elem[filterName])
	}
	get(id)
	{
		const filtered = this.items.filter((elem)=>{ return (elem.id == id)})
		if(filtered.length)
		{
			return filtered[0].geo_data
		}
		return null
	}
	search(filterName, filterOperator, filterValue, sortName, sortAsc)
	{
		let searchResult
		//gather all possible attributes to work with from 1st object in the json
		let props = []
		for(var i in this.items[0])
		{
			props.push(i)
		}
		logger.debug(props)

		if(filterName == null)
		{
			searchResult = this.items
		}else
		{//manage filtering
			if(props.indexOf(filterName) >= 0)
			{//the filer attribut exists
				if(filterOperator == "like")
				{//we antislash regex operators
					let matches = filterValue.match(/\[|\]|\-|\.|\(|\)|\?|\|/gi)
					if(matches)
						matches.forEach((elem)=>{ filterValue.replace(elem, "\\" + elem)})
					//we transform * into regex 
					let regex = new RegExp("^" + filterValue.split("*").join(".*") + "$", "g")
					searchResult = this.items.filter((elem)=>{return this.filterLike(elem, filterName, filterValue, regex)})
				}else{
					searchResult = this.items.filter((elem)=>{return this.filterEqual(elem, filterName, filterValue)})
				}
			}else{
				throw new Error("invalid query: unknown property :" + filterName + ". Valid properties are : [\n" + props.join(",\n") + "\n]")
			}

			
			
		}
		if(sortName != null)
		{//manage sorting
			if(props.indexOf(sortName) >= 0)
			{//the sortName is valid 
				searchResult = searchResult.sort((a, b)=>{
					if(a[sortName] > b[sortName]){
						if(sortAsc){
							return 1
						}
						return -1
					}else if(a[sortName] < b[sortName]){
						if(sortAsc){
							return -1
						}
						return 1
					}else{
						return 0
					}
				})
			}else{
				throw new Error("invalid query: unknown property :" + sortName + ". Valid properties are : [" + props.join(",") + "]")
			}
			
		}
		
		return searchResult.map((elem)=>{
			//we send only the properties that were defined in the configuration in the constructor
			let obj = {}
			this.config.returnedAttrs.forEach((attrName)=>{ obj[attrName] = elem[attrName]})
			return obj
		})

	}

}