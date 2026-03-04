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
  const owoDecorationType =
    vscode.window.createTextEditorDecorationType({
      textDecoration: "none; opacity: 0;", // Makes original char invisible but keeps its width
      color: "var(--vscode-editor-foreground)",
      // textDecoration: 'none; display: none;',
    })

  function updateDecorations() {
    const editor = vscode.window.activeTextEditor
    if (!editor) return

    const text = editor.document.getText()
    const wordRegex = /\b\w+\b/g
    const decorations: vscode.DecorationOptions[] = []

    let match
    while ((match = wordRegex.exec(text))) {
      const original = match[0]
      const transformed = owowify(original)
      const wordOffset = match.index

      if (transformed !== original) {
        // Diffing logic: compare char by char
        // TODO unused vars show old and new chars
        // const maxLength = Math.max(
        //   original.length,
        //   transformed.length,
        // )

        // Inside your while loop comparing original vs transformed:
        // Initial pointers for original (i) and transformed (j)
        for (
          let i = 0, j = 0;
          i < original.length || j < transformed.length;
        ) {
          const oldChar = original[i]
          const newChar = transformed[j]

          // 1. PERFECT MATCH: No decoration needed
          if (oldChar === newChar) {
            i++
            j++
            continue
          }

          const startPos = editor.document.positionAt(wordOffset + i)

          // 2. SMART REPLACE: Check if the characters before these are the same
          // If original[i+1] matches transformed[j+1], it's a 1-to-1 swap (like l -> w)
          if (
            oldChar &&
            newChar &&
            original[i + 1] === transformed[j + 1]
          ) {
            const endPos = editor.document.positionAt(
              wordOffset + i + 1,
            )
            decorations.push({
              range: new vscode.Range(startPos, endPos),
              renderOptions: {
                before: {
                  contentText: newChar,
                  color: "inherit",
                  textDecoration: `none; position: absolute; width: 1ch; translate: 0ch 0;`,
                },
              },
            })
            i++
            j++
          }
          // 3. SMART INSERT: If the oldChar matches the *next* newChar, we inserted something
          // Example: null -> nyull. original[1] is 'u', transformed[2] is 'u'.
          else if (newChar && oldChar === transformed[j + 1]) {
            decorations.push({
              range: new vscode.Range(startPos, startPos), // Point range = no transparency
              renderOptions: {
                before: {
                  contentText: newChar,
                  color: "inherit",
                  textDecoration: `none; position: relative; display: inline-block; width: 1ch;`,
                },
              },
            })
            j++ // Move transformed pointer only
          }
          // 4. SMART DELETE: If newChar matches the *next* oldChar, we removed something
          else if (oldChar && original[i + 1] === newChar) {
            const endPos = editor.document.positionAt(
              wordOffset + i + 1,
            )
            decorations.push({
              range: new vscode.Range(startPos, endPos),
            }) // Just hide it
            i++ // Move original pointer only
          }
          // 5. FALLBACK: If nothing matches ahead, assume 1-to-1 replacement
          else {
            if (oldChar || newChar) {
              const endPos = editor.document.positionAt(
                wordOffset + (oldChar ? i + 1 : i),
              )
              decorations.push({
                range: new vscode.Range(startPos, endPos),
                renderOptions: {
                  before: {
                    contentText: newChar || "",
                    color: "inherit",
                    textDecoration:
                      oldChar ?
                        `none; position: absolute; width: 1ch; translate: 0ch 0;`
                      : `none; position: relative;`,
                  },
                },
              })
            }
            if (oldChar) i++
            if (newChar) j++
          }
        }
      }
    }
    editor.setDecorations(owoDecorationType, decorations)
  }

  // --- Listeners with Debounce ---
  let timeout: NodeJS.Timeout | undefined
  function trigger() {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(updateDecorations, 50)
  }

  vscode.workspace.onDidChangeTextDocument(
    updateDecorations,
    null,
    context.subscriptions,
  )
  vscode.window.onDidChangeActiveTextEditor(
    updateDecorations,
    null,
    context.subscriptions,
  )

  // Initial call
  updateDecorations()
}

// This method is called when your extension is deactivated
export function deactivate() {}
