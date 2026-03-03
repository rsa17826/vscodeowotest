// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"

/**
 * @param {String} inputText
 * @returns {String}
 */
function owowify(inputText: string) {
  const endSentencePattern = String.raw`([\w ,.!?]+)?` // endSentencePattern
  // const endSentencePattern1 = String.raw`([\w ,.?]+)?`; // endSentencePattern without "!" sign
  // const endSentencePattern2 = String.raw`([\w ,.]+)?`; // endSentencePattern without "!" and "?" sign
  const vowel = "[aiueo]"
  const vowelNoE = "[aiuo]" // vowel without e
  const vowelNoIE = "[auo]" // vowel without i and e
  const zackqyWord = "[jzckq]"
  var result = inputText
  // OwO emote
  result = result.replace(
    reg`/(i(?:'|)m(?:\s+|\s+so+\s+)bored)${endSentencePattern}/gi`,
    subOwoEmote("-w-"),
  )
  result = result.replace(
    reg`/(love\s+(?:you|him|her|them))${endSentencePattern}/gi`,
    subOwoEmote("uwu"),
  )
  result = result.replace(
    reg`/(i\s+don(?:'|)t\s+care|i\s*d\s*c)${endSentencePattern}/gi`,
    subOwoEmote("0w0"),
  )
  // world substitution
  result = result.replace(reg`/l[ou]ve?/gi`, ($0) =>
    subSameCase($0, "luv"),
  )
  // OwO translation
  // /*result = result replace all "r" to "w", no exception! */
  //     result = result.replace(/r/gi, $0 => subSameCase($0, "w"))
  /*result = result replace all "r" to "w", unless r is alone */
  result = result.replace(/(?<=\w)r/gi, ($0) => subSameCase($0, "w"))
  result = result.replace(/r(?=\w)/gi, ($0) => subSameCase($0, "w"))
  /* lame -> wame, goal -> goaw, gallery -> gallewy, lol -> lol, null -> null */
  // loaded -> woaded
  // url -> uwl instead of uww
  result = result.replace(
    reg`/(?<!([wl]${vowel}*))l(?!([wl]))/gi`,
    ($0) => subSameCase($0, "w"),
  )
  /* na -> nya, nu -> nyu, no -> nyo, ne -> nye */
  // completionInfo -> compwetionInfo instead of compwetionYInfo
  result = result.replace(reg`/[nN](${vowelNoE}+)/g`, ($0, $vowel) =>
    subSameCase($0 + $vowel, `ny${$vowel}`),
  )
  result = result.replace(
    reg`/N(${vowelNoE.toUpperCase()}+)/g`,
    ($0: string, $vowel: string) =>
      subSameCase($0 + $vowel, `ny${$vowel}`),
  )
  /* ma -> mya, mu -> myu, mo -> myo */
  result = result.replace(
    reg`/[mM](${vowelNoIE}+)(?!w*${zackqyWord})/g`,
    ($0: string, $vowel: string) =>
      subSameCase($0 + $vowel, `my${$vowel}`),
  )
  result = result.replace(
    reg`/M(${vowelNoE.toUpperCase()}+)(?!w*${zackqyWord})/g`,
    ($0: string, $vowel: string) =>
      subSameCase($0 + $vowel, `my${$vowel}`),
  )
  /* pa -> pwa, pu -> pwu, po -> pwo */
  // AhkStopAlt -> AhkStopAwt instead of AhkStopWAwt
  result = result.replace(
    reg`/[pP](${vowelNoIE}+)(?!w*${zackqyWord})/g`,
    ($0: string, $vowel: string) =>
      subSameCase($0 + $vowel, `pw${$vowel}`),
  )
  result = result.replace(
    reg`/P(${vowelNoIE.toUpperCase()}+)(?!w*${zackqyWord})/g`,
    ($0: string, $vowel: string) =>
      subSameCase($0 + $vowel, `pw${$vowel}`),
  )

  return result
}

function subOwoEmote(emote: string) {
  const matchEndSpace = /^\s+$/g

  return (
    $0: string,
    $sentenceBeforeEnd: string,
    $endSentence: string,
  ) => {
    if (
      $endSentence == undefined ||
      matchEndSpace.test($endSentence)
    ) {
      return `${$sentenceBeforeEnd} ${emote}`
    } else return $0
  }
}

/**
 * @param {string} inputText
 * @param {string} replaceText
 */
function subSameCase(inputText: string, replaceText: string) {
  let result = ""

  for (let i = 0; i < replaceText.length; i++) {
    if (inputText[i] != undefined && replaceText[i] != undefined) {
      if (inputText[i].toUpperCase() == inputText[i]) {
        result += replaceText[i].toUpperCase()
      } else if (inputText[i].toLowerCase() == inputText[i]) {
        result += replaceText[i].toLowerCase()
      } else {
        result += replaceText[i]
      }
    } else {
      result += replaceText[i]
    }
  }

  return result
}

/** @param {[string[], ...any[]]} templateArgs */
function reg(
  strings: TemplateStringsArray,
  ...values: any[]
): RegExp {
  const rawString = String.raw({ raw: strings }, ...values)
  const pattern = rawString.substring(1, rawString.lastIndexOf("/"))
  const flags = rawString.substring(
    rawString.lastIndexOf("/") + 1,
    rawString.length,
  )

  return new RegExp(pattern, flags)
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // 1. Create ONE decoration type and REUSE it.
  const owoDecorationType = vscode.window.createTextEditorDecorationType({
      textDecoration: 'none; font-size: 0.001px;', // Collapses original text without losing cursor
      color: 'transparent',
  });

  function updateDecorations() {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const text = editor.document.getText();
      const wordRegex = /\b\w+\b/g;
      const decorations: vscode.DecorationOptions[] = [];

      let match;
      while ((match = wordRegex.exec(text))) {
          const original = match[0];
          const transformed = owowify(original);

          if (transformed !== original) {
              const startPos = editor.document.positionAt(match.index);
              const endPos = editor.document.positionAt(match.index + original.length);

              decorations.push({
                  range: new vscode.Range(startPos, endPos),
                  renderOptions: {
                      before: {
                          contentText: transformed,
                          color: 'inherit', // Matches your theme color
                          fontStyle: 'normal',
                          fontWeight: 'normal',
                          textDecoration: 'none; font-size: 100%;', // Restores size for the fake text
                      }
                  }
              });
          }
      }

      // 2. This is the key: setDecorations updates everything in one frame.
      // No clearing first = no flickering.
      editor.setDecorations(owoDecorationType, decorations);
  }

  // --- Listeners with Debounce ---
  let timeout: NodeJS.Timeout | undefined;
  function trigger() {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(updateDecorations, 50);
  }

  vscode.workspace.onDidChangeTextDocument(trigger, null, context.subscriptions);
  vscode.window.onDidChangeActiveTextEditor(trigger, null, context.subscriptions);
  
  // Initial call
  trigger();
}

// This method is called when your extension is deactivated
export function deactivate() {}
