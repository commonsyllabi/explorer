export const getAcademicFieldsText = (_fields: number[]) => {
    let fields: string[] = [];

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
                fields.push( "Education");
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
                fields.push( "Arts");
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
                fields.push( "Humanities");
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
        
            case 300:
                fields.push("Social sciences, journalism and information");
                break
            case 31:
                fields.push( "Social and behavioural sciences");
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
                fields.push( "Journalism and information");
                break
            case 321:
                fields.push("Journalism and reporting");
                break
            case 322:
                fields.push("Library, information and archival studies");
                break
        
            case 400:
                fields.push("Business, Administration and law");
                break
            case 41:
                fields.push( "Business and administration");
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
                fields.push( "Law");
                break
            case 421:
                fields.push("Law");
                break
        
            case 500:
                fields.push("Natural sciences, mathematics and statistics");
                break
            case 51:
                fields.push( "Biological and related sciences");
                break
            case 511:
                fields.push("Biology");
                break
            case 512:
                fields.push("Biochemistry");
                break
            case 52:
                fields.push( "Environment");
                break
            case 521:
                fields.push("Environmental sciences");
                break
            case 522:
                fields.push("Natural environments and wildlife");
                break
            case 53:
                fields.push( "Physical Sciences");
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
                fields.push( "Mathematics and sciences");
                break
            case 541:
                fields.push("Mathematics");
                break
            case 542:
                fields.push("Statistics");
                break
        
            case 600:
                fields.push("Information and communication technologies");
                break
            case 61:
                fields.push( "Information and Communication Technologies");
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
        
            case 700:
                fields.push("Engineering, manufacturing and construction");
                break
            case 71:
                fields.push( "Engineering and engineering trades");
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
                fields.push( "Manufacturing and processing");
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
                fields.push( "Architecture and construction");
                break
            case 731:
                fields.push("Architecture and town planning");
                break
            case 732:
                fields.push("Building and civil engineering");
                break
        
            case 800:
                fields.push("Agriculture, forestry, fisheries and veterinary");
                break
            case 81:
                fields.push( "Agriculture");
                break
            case 811:
                fields.push("Crop and livestock production");
                break
            case 812:
                fields.push("Horticulture");
                break
            case 82:
                fields.push( "Forestry");
                break
            case 821:
                fields.push("Forestry");
                break
            case 83:
                fields.push( "Fisheries");
                break
            case 831:
                fields.push("Fisheries");
                break
            case 84:
                fields.push( "Veterinary");
                break
            case 841:
                fields.push("Veterinary");
                break
        
            case 900:
                fields.push("Health and Welfare");
                break
            case 91:
                fields.push( "Health");
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
        
            case 1000:
                fields.push("Services");
                break
            case 101:
                fields.push( "Personal services");
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
                fields.push( "Hygiene and occupational health services");
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
                fields.push( "Transport");
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