var movies = {
    "180":{
        "genres":["Action","Mystery","Science Fiction","Thriller"],
        "actorIds":[500,2201,2202,2203,2205,72466,2206,2207,2208,53,83141,32286],
        "title":"Minority Report",
        "revenue":358372926,
        "poster":"/gDX5WRJlLMFT40Ft6BZCwIk8sB9.jpg",
        "directorId":488
    },
    "954":{
        "genres":["Action","Adventure","Thriller"],
        "actorIds":[500,10127,4885,15319,1003,10182,5470,13333,3211,15320,15321,14593,15322,10849,15323],
        "title":"Mission: Impossible",
        "revenue":456494803,
        "poster":"/1PVKS17pIBFsIhgFws2uagPDNLW.jpg",
        "directorId":1150
    },
    "1903":{
        "genres":["Drama","Mystery","Science Fiction","Thriller","Romance"],
        "actorIds":[500,955,6941,6856,11662,1284,9191,3063,19851,3128,335],
        "title":"Vanilla Sky",
        "revenue":203388341,
        "poster":"/eMc34dLOqqei505wBGwfY1Y48Tu.jpg",
        "directorId":11649
    }
};

var actors = {
    "53":{
        "movieIds":[180],
        "name":"Peter Stormare",
        "dob":"1953-08-27",
        "profile":"/yYEANZYw6sFnasgIbVdd8Ed0mxA.jpg"
    },
    "335":{
        "movieIds":[1903],
        "name":"Michael Shannon",
        "dob":"1974-08-07",
        "profile":"/rkjdHaF7bQh7sroZhKcW7QTbZyD.jpg"
    },
    "500":{
        "movieIds":[1903,180,954],
        "name":"Tom Cruise",
        "dob":"1962-07-03",
        "profile":"/cNuFoWtpL34JBBy1N4RNX3GmmFr.jpg"
    },
    "955":{
        "movieIds":[1903],
        "name":"Penélope Cruz",
        "dob":"1974-04-28",
        "profile":"/yuaSpE3upUX4219lGI2glBbfLkP.jpg"
    },
    "1003":{
        "movieIds":[954],
        "name":"Jean Reno",
        "dob":"1948-07-30",
        "profile":"/AoQzEC2uHRfZLM54eUyPfhMvydy.jpg"
    },
    "1284":{
        "movieIds":[1903],
        "name":"Noah Taylor",
        "dob":"1969-09-04",
        "profile":"/xUI8200GjUcgWiAk9wSS018OC5B.jpg"
    },
    "2201":{
        "movieIds":[180],
        "name":"Max von Sydow",
        "dob":"1929-04-10",
        "profile":"/kCdNYfUlswqjDYhnE54kMoDHWTp.jpg"
    },
    "2202":{
        "movieIds":[180],
        "name":"Steve Harris",
        "dob":"1965-12-03",
        "profile":"/nnCjf1GgCGUXn3YlFxueOVxezFc.jpg"
    },
    "2203":{
        "movieIds":[180],
        "name":"Neal McDonough",
        "dob":"1966-02-13",
        "profile":"/njv23gYwTiLD5nVgD5F4kRZFkaC.jpg"
    },
    "2205":{
        "movieIds":[180],
        "name":"Jessica Capshaw",
        "dob":"1976-08-09",
        "profile":"/pDTBPqckmOVgP7DseLG0cKNrmtU.jpg"
    },
    "2206":{
        "movieIds":[180],
        "name":"Samantha Morton",
        "dob":"1977-05-13",
        "profile":"/6xDVhWy8XPhfsXzxs5dr0DOEHqX.jpg"
    },
    "2207":{
        "movieIds":[180],
        "name":"Lois Smith",
        "dob":"1930-11-03",
        "profile":"/lx8YKSYR30aUbvfUj1ZWhJzrRxy.jpg"
    },
    "2208":{
        "movieIds":[180],
        "name":"Kathryn Morris",
        "dob":"1969-01-28",
        "profile":"/kacv3Og9yU1bp6RJGb4Asnhsavt.jpg"
    },
    "3063":{
        "movieIds":[1903],
        "name":"Tilda Swinton",
        "dob":"1960-11-05",
        "profile":"/yodhl99bxeSylyW9EDnMbj73J1h.jpg"
    },
    "3128":{
        "movieIds":[1903],
        "name":"Alicia Witt",
        "dob":"1975-08-21",
        "profile":"/2486Rrn2lQYpyB5nRzoNg7PyW6M.jpg"
    },
    "3211":{
        "movieIds":[954],
        "name":"Dale Dye",
        "dob":"1944-10-08",
        "profile":"/vQfhfRjwOHYN3Egx1SB21ResBI2.jpg"
    },
    "4885":{
        "movieIds":[954],
        "name":"Emmanuelle Béart",
        "dob":"1963-08-14",
        "profile":"/83cvgrlwp6EfTupKsU7ANln3uBs.jpg"
    },
    "5470":{
        "movieIds":[954],
        "name":"Kristin Scott Thomas",
        "dob":"1960-05-24",
        "profile":"/4V20iTemty47qQZ77qH7p4dfx6Z.jpg"
    },
    "6856":{
        "movieIds":[1903],
        "name":"Kurt Russell",
        "dob":"1951-03-17",
        "profile":"/3J9l6iHcWQN28QNMpcb1QO7m2Xt.jpg"
    },
    "6941":{
        "movieIds":[1903],
        "name":"Cameron Diaz",
        "dob":"1972-08-30",
        "profile":"/kTkNNW2cXiwTsWZ2jWWwWPhBuKw.jpg"
    },
    "9191":{
        "movieIds":[1903],
        "name":"Timothy Spall",
        "dob":"1957-02-27",
        "profile":"/asDZhmWZ1tFaiuvugqHLRwtdWr5.jpg"
    },
    "10127":{
        "movieIds":[954],
        "name":"Jon Voight",
        "dob":"1938-12-29",
        "profile":"/5mQh73XzhnxlPnIp34qt41VQp6e.jpg"
    },
    "10182":{
        "movieIds":[954],
        "name":"Ving Rhames",
        "dob":"1959-05-12",
        "profile":"/qfp236BgZ8S8sfFJvDTd3gjB3Ml.jpg"
    },
    "10849":{
        "movieIds":[954],
        "name":"Marek Vasut",
        "dob":null,
        "profile":null
    },
    "11662":{
        "movieIds":[1903],
        "name":"Jason Lee",
        "dob":"1970-04-25",
        "profile":"/q8z5CgZhJzIqo0KmJVWj7YemtLA.jpg"
    },
    "13333":{
        "movieIds":[954],
        "name":"Vanessa Redgrave",
        "dob":"1937-01-30",
        "profile":"/5yoWBiVPqrq0nn5WZRzqTwQQ3SF.jpg"
    },
    "14593":{
        "movieIds":[954],
        "name":"Ingeborga Dapkunaite",
        "dob":"1963-01-20",
        "profile":"/1bS8WvHfCPRDBiIDy6fuMFzaP1f.jpg"
    },
    "15319":{
        "movieIds":[954],
        "name":"Henry Czerny",
        "dob":"1959-02-08",
        "profile":"/lAyIBQfmn7BUvuoVu5Eb19iWiuX.jpg"
    },
    "15320":{
        "movieIds":[954],
        "name":"Marcel Iures",
        "dob":"1951-08-02",
        "profile":"/3xONkmWY24E9HyKJw9iy5Sw8o9C.jpg"
    },
    "15321":{
        "movieIds":[954],
        "name":"Ion Caramitru",
        "dob":"1942-03-09",
        "profile":"/lHgFi4CUYavMKVW7xTbHj4CoMEn.jpg"
    },
    "15322":{
        "movieIds":[954],
        "name":"Valentina Yakunina",
        "dob":null,
        "profile":null
    },
    "15323":{
        "movieIds":[954],
        "name":"Nathan Osgood",
        "dob":null,
        "profile":null
    },
    "19851":{
        "movieIds":[1903],
        "name":"Armand Schultz",
        "dob":"1959-05-17",
        "profile":"/eetpKDq1kyTpZBJLrHebX88tHnY.jpg"
    },
    "32286":{
        "movieIds":[180],
        "name":"Patrick Kilpatrick",
        "dob":"1949-08-20",
        "profile":"/htbGGYfKBmZgu3Fit4WDJNeG8VG.jpg"
    },
    "72466":{
        "movieIds":[180],
        "name":"Colin Farrell",
        "dob":"1976-05-31",
        "profile":"/tFMWlEeZNmgG8WsWgPm4Mjd6Tgc.jpg"
    },
    "83141":{
        "movieIds":[180],
        "name":"Paul Wesley",
        "dob":"1982-07-23",
        "profile":"/arhkjiCDzV9GxwKWIqBt095tnna.jpg"
    }
};

var directors = {
    "488":{
        "movieIds":[180],
        "name":"Steven Spielberg",
        "dob":"1946-12-18",
        "profile":"/jRWARxzljSY8SbOKTludOSECdk7.jpg"
    },
    "1150":{
        "movieIds":[954],
        "name":"Brian De Palma",
        "dob":"1940-09-11",
        "profile":"/siizhVqpdR3hdBaGG5XsjFEJkWf.jpg"
    },
    "11649":{
        "movieIds":[1903],
        "name":"Cameron Crowe",
        "dob":"1957-07-13",
        "profile":"/sTv9iN8sykNGC1lXyYDyoCIGcrd.jpg"
    }
};