export const getAcademicFieldsText = (_fields: number[]) => {
    let fields: string[] = [];

    if(!_fields) return ["Default"]

    for (const field of _fields) {
        switch (field) {
            case 0:
                fields.push("Generic");
                break
            case 1:
                fields.push("Basic programmes and qualifications");
                break
            case 2:
                fields.push("Literacy and numeracy");
                break
            case 3:
                fields.push("Personal skills and development");
                break

            case 100:
                fields.push("Education");
                break
            case 11:
                fields.push("Education");
                break
            case 111:
                fields.push("Education sciences");
                break
            case 112:
                fields.push("Training for pre-school teachers");
                break
            case 113:
                fields.push("Teacher training without subject specialization");
                break
            case 114:
                fields.push("Teacher training with subject specialization");
                break

            case 200:
                fields.push("Arts and humanities");
                break
            case 21:
                fields.push("Arts");
                break
            case 211:
                fields.push("Audio-visual techniques and media production");
                break
            case 212:
                fields.push("Fashion, interior and industrial design");
                break
            case 213:
                fields.push("Fine arts");
                break
            case 214:
                fields.push("Handicrafts");
                break
            case 215:
                fields.push("Music and performing arts");
                break
            case 22:
                fields.push("Humanities");
                break
            case 221:
                fields.push("Religion and theology");
                break
            case 222:
                fields.push("History and archeology");
                break
            case 223:
                fields.push("Philosophy and ethics");
                break
            case 231:
                fields.push("Language acquisition");
                break
            case 232:
                fields.push("Literature and linguistics");
                break

            case 3:
                fields.push("Social sciences, journalism and information");
                break
            case 31:
                fields.push("Social and behavioural sciences");
                break
            case 311:
                fields.push("Economics");
                break
            case 312:
                fields.push("Political sciences and civics");
                break
            case 313:
                fields.push("Psychology");
                break
            case 314:
                fields.push("Sociology and cultural studies");
                break
            case 32:
                fields.push("Journalism and information");
                break
            case 321:
                fields.push("Journalism and reporting");
                break
            case 322:
                fields.push("Library, information and archival studies");
                break

            case 4:
                fields.push("Business, Administration and law");
                break
            case 41:
                fields.push("Business and administration");
                break
            case 411:
                fields.push("Accounting and taxation");
                break
            case 412:
                fields.push("Finance, banking and insurance");
                break
            case 413:
                fields.push("Management and administration");
                break
            case 414:
                fields.push("Marketing and advertising");
                break
            case 415:
                fields.push("Secretarial and office work");
                break
            case 416:
                fields.push("Wholesale and retail sales");
                break
            case 417:
                fields.push("Work skills");
                break
            case 42:
                fields.push("Law");
                break
            case 421:
                fields.push("Law");
                break

            case 5:
                fields.push("Natural sciences, mathematics and statistics");
                break
            case 51:
                fields.push("Biological and related sciences");
                break
            case 511:
                fields.push("Biology");
                break
            case 512:
                fields.push("Biochemistry");
                break
            case 52:
                fields.push("Environment");
                break
            case 521:
                fields.push("Environmental sciences");
                break
            case 522:
                fields.push("Natural environments and wildlife");
                break
            case 53:
                fields.push("Physical Sciences");
                break
            case 531:
                fields.push("Chemistry");
                break
            case 532:
                fields.push("Earth sciences");
                break
            case 533:
                fields.push("Physics");
                break
            case 54:
                fields.push("Mathematics and sciences");
                break
            case 541:
                fields.push("Mathematics");
                break
            case 542:
                fields.push("Statistics");
                break

            case 6:
                fields.push("Information and communication technologies");
                break
            case 61:
                fields.push("Information and Communication Technologies");
                break
            case 611:
                fields.push("Computer use");
                break
            case 612:
                fields.push("Database and network design and administration");
                break
            case 613:
                fields.push("Software and application development and anaysis");
                break

            case 7:
                fields.push("Engineering, manufacturing and construction");
                break
            case 71:
                fields.push("Engineering and engineering trades");
                break
            case 711:
                fields.push("Chemical engineering and processes");
                break
            case 712:
                fields.push("Environmental protextion technology");
                break
            case 713:
                fields.push("Electricity and energy");
                break
            case 714:
                fields.push("Electronics and automation");
                break
            case 715:
                fields.push("Mechanics and metal trades");
                break
            case 716:
                fields.push("Motor vehicles, ships and aircrafts");
                break
            case 72:
                fields.push("Manufacturing and processing");
                break
            case 721:
                fields.push("Food processing");
                break
            case 722:
                fields.push("Materials (glass, paper, plastic and wood)");
                break
            case 723:
                fields.push("Textile (clothes, footwear, leather)");
                break
            case 724:
                fields.push("Mining and extraction");
                break
            case 73:
                fields.push("Architecture and construction");
                break
            case 731:
                fields.push("Architecture and town planning");
                break
            case 732:
                fields.push("Building and civil engineering");
                break

            case 8:
                fields.push("Agriculture, forestry, fisheries and veterinary");
                break
            case 81:
                fields.push("Agriculture");
                break
            case 811:
                fields.push("Crop and livestock production");
                break
            case 812:
                fields.push("Horticulture");
                break
            case 82:
                fields.push("Forestry");
                break
            case 821:
                fields.push("Forestry");
                break
            case 83:
                fields.push("Fisheries");
                break
            case 831:
                fields.push("Fisheries");
                break
            case 84:
                fields.push("Veterinary");
                break
            case 841:
                fields.push("Veterinary");
                break

            case 9:
                fields.push("Health and Welfare");
                break
            case 91:
                fields.push("Health");
                break
            case 911:
                fields.push("Dental studies");
                break
            case 912:
                fields.push("Medicine");
                break
            case 913:
                fields.push("Nursing and midwifery");
                break
            case 914:
                fields.push("Medical diagnostic and treatment technology");
                break
            case 915:
                fields.push("Therapy and rehabilitation");
                break
            case 916:
                fields.push("Pharmacy");
                break
            case 917:
                fields.push("Traditional and complementary medicine and therapy");
                break

            case 10:
                fields.push("Services");
                break
            case 101:
                fields.push("Personal services");
                break
            case 1011:
                fields.push("Domestic services");
                break
            case 1012:
                fields.push("Hair and beauty services");
                break
            case 1013:
                fields.push("Hotel, restaurants and catering");
                break
            case 1014:
                fields.push("Sports");
                break
            case 1015:
                fields.push("Travel, tourism, and leisure");
                break
            case 102:
                fields.push("Hygiene and occupational health services");
                break
            case 1021:
                fields.push("Community sanitation");
                break
            case 1022:
                fields.push("Occupational and health and safety");
                break
            case 1031:
                fields.push("Military and defence");
                break
            case 1032:
                fields.push("Protection of persons and property");
                break
            case 104:
                fields.push("Transport");
                break
            case 1041:
                fields.push("Transportation services");
                break
            default:
                fields.push(`Default: ${field}`)
        }
    }

    return fields;
};

export const getSingleAcademicFieldText = (_field: number) => {
    switch (_field) {
        case 0:
            return ("Generic");
        case 1:
            return ("Basic programmes and qualifications");
        case 2:
            return ("Literacy and numeracy");
        case 3:
            return ("Personal skills and development");
        case 100:
            return ("Education");
        case 11:
            return ("Education");
        case 111:
            return ("Education sciences");
        case 112:
            return ("Training for pre-school teachers");
        case 113:
            return ("Teacher training without subject specialization");
        case 114:
            return ("Teacher training with subject specialization");
        case 200:
            return ("Arts and humanities");
        case 21:
            return ("Arts");
        case 211:
            return ("Audio-visual techniques and media production");
        case 212:
            return ("Fashion, interior and industrial design");
        case 213:
            return ("Fine arts");
        case 214:
            return ("Handicrafts");
        case 215:
            return ("Music and performing arts");
        case 22:
            return ("Humanities");
        case 221:
            return ("Religion and theology");
        case 222:
            return ("History and archeology");
        case 223:
            return ("Philosophy and ethics");
        case 231:
            return ("Language acquisition");
        case 232:
            return ("Literature and linguistics");
        case 3:
            return ("Social sciences, journalism and information");
        case 31:
            return ("Social and behavioural sciences");
        case 311:
            return ("Economics");
        case 312:
            return ("Political sciences and civics");
        case 313:
            return ("Psychology");
        case 314:
            return ("Sociology and cultural studies");
        case 32:
            return ("Journalism and information");
        case 321:
            return ("Journalism and reporting");
        case 322:
            return ("Library, information and archival studies");
        case 4:
            return ("Business, Administration and law");
        case 41:
            return ("Business and administration");
        case 411:
            return ("Accounting and taxation");
        case 412:
            return ("Finance, banking and insurance");
        case 413:
            return ("Management and administration");
        case 414:
            return ("Marketing and advertising");
        case 415:
            return ("Secretarial and office work");
        case 416:
            return ("Wholesale and retail sales");
        case 417:
            return ("Work skills");
        case 42:
            return ("Law");
        case 421:
            return ("Law");
        case 5:
            return ("Natural sciences, mathematics and statistics");
        case 51:
            return ("Biological and related sciences");
        case 511:
            return ("Biology");
        case 512:
            return ("Biochemistry");
        case 52:
            return ("Environment");
        case 521:
            return ("Environmental sciences");
        case 522:
            return ("Natural environments and wildlife");
        case 53:
            return ("Physical Sciences");
        case 531:
            return ("Chemistry");
        case 532:
            return ("Earth sciences");
        case 533:
            return ("Physics");
        case 54:
            return ("Mathematics and sciences");
        case 541:
            return ("Mathematics");
        case 542:
            return ("Statistics");
        case 6:
            return ("Information and communication technologies");
        case 61:
            return ("Information and Communication Technologies");
        case 611:
            return ("Computer use");
        case 612:
            return ("Database and network design and administration");
        case 613:
            return ("Software and application development and anaysis");
        case 7:
            return ("Engineering, manufacturing and construction");
        case 71:
            return ("Engineering and engineering trades");
        case 711:
            return ("Chemical engineering and processes");
        case 712:
            return ("Environmental protextion technology");
        case 713:
            return ("Electricity and energy");
        case 714:
            return ("Electronics and automation");
        case 715:
            return ("Mechanics and metal trades");
        case 716:
            return ("Motor vehicles, ships and aircrafts");
        case 72:
            return ("Manufacturing and processing");
        case 721:
            return ("Food processing");
        case 722:
            return ("Materials (glass, paper, plastic and wood)");
        case 723:
            return ("Textile (clothes, footwear, leather)");
        case 724:
            return ("Mining and extraction");
        case 73:
            return ("Architecture and construction");
        case 731:
            return ("Architecture and town planning");
        case 732:
            return ("Building and civil engineering");
        case 8:
            return ("Agriculture, forestry, fisheries and veterinary");
        case 81:
            return ("Agriculture");
        case 811:
            return ("Crop and livestock production");
        case 812:
            return ("Horticulture");
        case 82:
            return ("Forestry");
        case 821:
            return ("Forestry");
        case 83:
            return ("Fisheries");
        case 831:
            return ("Fisheries");
        case 84:
            return ("Veterinary");
        case 841:
            return ("Veterinary");
        case 9:
            return ("Health and Welfare");
        case 91:
            return ("Health");
        case 911:
            return ("Dental studies");
        case 912:
            return ("Medicine");
        case 913:
            return ("Nursing and midwifery");
        case 914:
            return ("Medical diagnostic and treatment technology");
        case 915:
            return ("Therapy and rehabilitation");
        case 916:
            return ("Pharmacy");
        case 917:
            return ("Traditional and complementary medicine and therapy");
        case 10:
            return ("Services");
        case 101:
            return ("Personal services");
        case 1011:
            return ("Domestic services");
        case 1012:
            return ("Hair and beauty services");
        case 1013:
            return ("Hotel, restaurants and catering");
        case 1014:
            return ("Sports");
        case 1015:
            return ("Travel, tourism, and leisure");
        case 102:
            return ("Hygiene and occupational health services");
        case 1021:
            return ("Community sanitation");
        case 1022:
            return ("Occupational and health and safety");
        case 1031:
            return ("Military and defence");
        case 1032:
            return ("Protection of persons and property");
        case 104:
            return ("Transport");
        case 1041:
            return ("Transportation services");
        default:
            return (`Default: ${_field}`)
    }
}