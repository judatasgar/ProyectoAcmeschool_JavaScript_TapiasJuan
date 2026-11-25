export const examenesPrueba = [
  {
    "codigo": "GEO-01",
    "titulo": "Geografía básica",
    "tiempo": 10,
    "porcentajeAprobacion": 60,
    "descripcion": "Examen sencillo sobre conceptos básicos de geografía",
    "preguntas": [
      {
        "enunciado": "¿Cuál es el continente más grande del mundo?",
        "respuestas": [
          { "texto": "África", "esCorrecta": false },
          { "texto": "Asia", "esCorrecta": true },
          { "texto": "Europa", "esCorrecta": false }
        ]
      },
      {
        "enunciado": "¿Cuál es el océano más grande del planeta?",
        "respuestas": [
          { "texto": "Atlántico", "esCorrecta": false },
          { "texto": "Índico", "esCorrecta": false },
          { "texto": "Pacífico", "esCorrecta": true }
        ]
      },
      {
        "enunciado": "¿En qué continente se encuentra Colombia?",
        "respuestas": [
          { "texto": "América", "esCorrecta": true },
          { "texto": "Europa", "esCorrecta": false },
          { "texto": "Asia", "esCorrecta": false }
        ]
      }
    ]
  },
  {
    "codigo": "MAT-01",
    "titulo": "Matemáticas básicas",
    "tiempo": 15,
    "porcentajeAprobacion": 70,
    "descripcion": "Operaciones, porcentajes y números primos",
    "preguntas": [
      {
        "enunciado": "¿Cuánto es 7 × 8?",
        "respuestas": [
          { "texto": "54", "esCorrecta": false },
          { "texto": "56", "esCorrecta": true },
          { "texto": "64", "esCorrecta": false },
          { "texto": "48", "esCorrecta": false }
        ]
      },
      {
        "enunciado": "¿Cuál es el resultado de 144 ÷ 12?",
        "respuestas": [
          { "texto": "12", "esCorrecta": true },
          { "texto": "14", "esCorrecta": false },
          { "texto": "11", "esCorrecta": false },
          { "texto": "16", "esCorrecta": false }
        ]
      },
      {
        "enunciado": "¿Cuánto es el 25% de 200?",
        "respuestas": [
          { "texto": "25", "esCorrecta": false },
          { "texto": "75", "esCorrecta": false },
          { "texto": "50", "esCorrecta": true },
          { "texto": "100", "esCorrecta": false }
        ]
      },
      {
        "enunciado": "¿Cuál de estos números es primo?",
        "respuestas": [
          { "texto": "21", "esCorrecta": false },
          { "texto": "27", "esCorrecta": false },
          { "texto": "33", "esCorrecta": false },
          { "texto": "29", "esCorrecta": true }
        ]
      },
      {
        "enunciado": "Un triángulo tiene un ángulo de 90° y otro de 45°. ¿Cuánto mide el tercero?",
        "respuestas": [
          { "texto": "45°", "esCorrecta": true },
          { "texto": "90°", "esCorrecta": false },
          { "texto": "60°", "esCorrecta": false },
          { "texto": "30°", "esCorrecta": false }
        ]
      }
    ]
  },
  {
    "codigo": "CIE-01",
    "titulo": "Ciencias naturales",
    "tiempo": 12,
    "porcentajeAprobacion": 60,
    "descripcion": "Sistema solar, plantas, agua y cuerpo humano",
    "preguntas": [
      {
        "enunciado": "¿Cuál es el planeta más cercano al Sol?",
        "respuestas": [
          { "texto": "Venus", "esCorrecta": false },
          { "texto": "Mercurio", "esCorrecta": true },
          { "texto": "Marte", "esCorrecta": false }
        ]
      },
      {
        "enunciado": "¿Qué gas absorben las plantas para hacer la fotosíntesis?",
        "respuestas": [
          { "texto": "Oxígeno", "esCorrecta": false },
          { "texto": "Nitrógeno", "esCorrecta": false },
          { "texto": "Dióxido de carbono", "esCorrecta": true }
        ]
      },
      {
        "enunciado": "¿A qué temperatura hierve el agua al nivel del mar?",
        "respuestas": [
          { "texto": "90 °C", "esCorrecta": false },
          { "texto": "100 °C", "esCorrecta": true },
          { "texto": "120 °C", "esCorrecta": false }
        ]
      },
      {
        "enunciado": "¿Qué órgano bombea la sangre por todo el cuerpo?",
        "respuestas": [
          { "texto": "El corazón", "esCorrecta": true },
          { "texto": "Los pulmones", "esCorrecta": false },
          { "texto": "El hígado", "esCorrecta": false }
        ]
      },
      {
        "enunciado": "¿Cuántos huesos tiene aproximadamente el cuerpo de un adulto?",
        "respuestas": [
          { "texto": "106", "esCorrecta": false },
          { "texto": "206", "esCorrecta": true },
          { "texto": "306", "esCorrecta": false }
        ]
      }
    ]
  }
]

export const usuariosPrueba = [
  {
    "identificacion": "0001",
    "nombre": "Coordinador Acme",
    "email": "admin@acme.edu",
    "telefono": "1234567890",
    "cargo": "administrativo",
    "password": "admin2431"
  }
]
