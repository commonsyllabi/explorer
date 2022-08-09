package models

var LEVELS = map[int]string{
	0: "Other",
	1: "Bachelor",
	2: "Master",
	3: "Doctoral",
}

var ACADEMIC_FIELDS = map[string]int{
	"Generic":             000,
	"Education":           100,
	"Arts and Humanities": 200,
	"Social Sciences, Journalism and Information":     300,
	"Business, Administration and Law":                400,
	"Natural Sciences, Mathematics and Statistics":    500,
	"Information and Communication Technologies":      600,
	"Engineering, Manufacturing and Construction":     700,
	"Agriculture, Forestry, Fisheries and Veterinary": 800,
	"Health and Welfare":                              900,
	"Services":                                        1000,
}
