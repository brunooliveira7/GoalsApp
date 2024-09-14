const { select, input, checkbox } = require("@inquirer/prompts"); //import module a functs, da biblioteca inquirer
const fs = require("fs").promises; //fs - pacote do Node

let message = "Bem vindo ao App de  Metas!!!";

let goals;

//funct de carregar as metas - para não precisar carregar na declaração de var, usa o arquivo Json,
const uploadGoals = async () => {
  try {
    const data = await fs.readFile("goals.json", "utf-8"); //ler o arquivo, que está no formato uft-8, e jogar na var
    goals = JSON.parse(data); //parse -converter os dados do Json para um array JS
  } catch (erro) {
    goals = []; //se der erro vai carregar um array vazio
  }
};

//funct para salvar as metas digitadas pelo user 
const saveGoals = async () => {
  await fs.writeFile("goals.json", JSON.stringify(goals, null, 2)); //ler e salvar o arquivo. Stringify - converte de JS para Json
};

//digitar a meta - no menu "cadastrar"
const registerGoal = async () => {
  const goal = await input({ message: "Digite a meta:" });

  if (goal.length == 0) {
    message = "A meta não pode ser vazia!";
    return;
  }

  //push - colocar no array goals (,outra meta - digitada pelo user)
  goals.push({ value: goal, checked: false });

  message = "Meta cadastrada com sucesso!";
};

//selecionar meta - no menu "listar metas" - inclusive a answers pelo user
const listGoals = async () => {
  if (goals.length == 0) {
    message = "Não existe metas!";
    return;
  }

  const answers = await checkbox({
    message:
      "Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o Enter para finalizar essa etapa",
    choices: [...goals], //... - pegando os itens do array goals e colocando no array choices
    instructions: false, // tirar a descriçao em inglês que é apresentada
  });

  //desmarcar todas da lista. Vai marcar ou remarcar na próxima funct
  goals.forEach((g) => {
    g.checked = false;
  });

  //se não fizer seleção
  if (answers.length == 0) {
    message = "Nenhuma meta selecionada!";
    return;
  }

  //para cada answers vai comparar com as goals da lista. O g é a primeira meta da lista. Vai testando
  answers.forEach((answer) => {
    const goal = goals.find((g) => {
      return g.value == answer;
    });

    //quando a goal bate com a listada - marca um check - verdadeiro
    goal.checked = true;
  });

  message = "Meta(s) marcada(s) como concluída(s)!";
};

//filter sempre executa uma funct
//funct com achieved que é um array só recebe meta checked, passadas no filtro
const goalsAchieved = async () => {
  if (goals.length == 0) {
    message = "Não existe metas!";
    return;
  }

  const achieved = goals.filter((goal) => {
    return goal.checked;
  });

  if (achieved.length == 0) {
    message = "Não existem metas realizadas!";
    return;
  }

  await select({
    message: `Metas realizadas: ${achieved.length}`,
    choices: [...achieved],
  });
};

const openGoals = async () => {
  if (goals.length == 0) {
    message = "Não existe metas!";
    return;
  }

  const open = goals.filter((goal) => {
    return goal.checked != true;
  });

  if (open.length == 0) {
    message = "Não existem metas abertas!";
    return;
  }

  await select({
    message: `Metas abertas: ${open.length}`,
    choices: [...open],
  });
};

//map sempre executa uma funct - modifica o array original
const deleteGoals = async () => {
  if (goals.length == 0) {
    message = "Não existe metas!";
    return;
  }

  //retorna metas com um novo nome (unmarkedGoals), para não modificar e deletar as metas já marcadas
  const unmarkedGoals = goals.map((goal) => {
    return { value: goal.value, checked: false }; //pega o valor do array original e modifica o checked para false (desmarcou) - para ficar claro que o que selecionar vai ser deletado
  });

  //novo array unmarkedGoals no formato checkbox apresentandos o todos os itens
  const itemsToDelete = await checkbox({
    message: "Selecione o item para deletar",
    choices: [...unmarkedGoals],
    instructions: false,
  });

  if (itemsToDelete.length == 0) {
    message = "Nenhum item para deletar";
    return;
  }

  //vai apresentar na nova lista de metas todos itens desmarcados (inclusive os concluídos)
  itemsToDelete.forEach((item) => {
    //substituir tudo que tem em metas
    goals = goals.filter((goal) => {
      return goal.value != item; //compara
    });
  });
  message = "Meta(s) deletada(s) com sucesso!";
};

const showMessage = () => {
  console.clear(); //limpa todas as mensagens

  //sempre que tiver mensagem
  if (message != "") {
    console.log(message); // vai colocar no lugar do vazio
    console.log(""); // só para quebra de linha
    message = ""; //limpa a mensagem
  }
};

//async - tem que declarar na funct para o await(espere - o user selecionar uma option) funcionar
//menu
const start = async () => {
  await uploadGoals(); //tem que esperar um tempo - para abrir o arquivo e carregar

  while (true) {
    showMessage(); //limpa todas as mensagens
    await saveGoals(); //tem que esperar um tempo - para abrir o arquivo e salvar

    const option = await select({
      message: "Menu >",
      //opções/escolhas do menu
      choices: [
        {
          name: "Cadastrar meta",
          value: "register",
        },
        {
          name: "Listar metas",
          value: "list",
        },
        {
          name: "Metas realizadas",
          value: "achieved",
        },
        {
          name: "Metas abertas",
          value: "open",
        },
        {
          name: "Deletar metas",
          value: "delete",
        },
        {
          name: "Sair",
          value: "leave",
        },
      ],
    });

    //para cada seleção roda um funct
    switch (option) {
      case "register":
        await registerGoal();
        break;
      case "list":
        await listGoals();
        break;
      case "achieved":
        await goalsAchieved();
        break;
      case "open":
        await openGoals();
        break;
      case "delete":
        await deleteGoals();
        break;
      case "leave":
        console.log("Até a próxima");
        return;
    }
  }
};

start();
