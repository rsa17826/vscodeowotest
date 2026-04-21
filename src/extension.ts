// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"

const owoCache = new Map<string, string>()

/**
 * @param {String} inputText
 * @returns {String}
 */
function owowify(inputText: string): string {
  if (owoCache.has(inputText)) {
    return owoCache.get(inputText)!
  }
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
    reg`/(?<!([wl]${vowel}*))(?:l(?=\\w)|(?<=\\w)l)(?!([wl]))/gi`,
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

  owoCache.set(inputText, result)
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

export function activate(context: vscode.ExtensionContext) {
  type TextReplaceApi = {
    getDecoratedRanges(doc: vscode.TextDocument): vscode.Range[]
    onDidUpdateRanges: vscode.Event<vscode.Uri>
  }
  let textReplaceApi: TextReplaceApi | undefined
  const updateRegistration = () => {
    console.log("extensions installed")
    if (textReplaceApi) {
      console.log("extensions FOUND")
      return
    }
    getTextReplaceApi()
    if (!textReplaceApi) {
      ;(async () => {
        const ext = vscode.extensions.getExtension<TextReplaceApi>(
          "rssaromeo.textreplace",
        )

        if (ext) {
          // This is the magic part. It triggers the other extension to wake up
          // and returns its exports (API) once it's ready.
          textReplaceApi = await ext.activate()

          context.subscriptions.push(
            textReplaceApi.onDidUpdateRanges((uri) => {
              const editor = vscode.window.visibleTextEditors.find(
                (e) => e.document.uri.toString() === uri.toString(),
              )
              if (editor) updateDecorationsForEditor(editor)
            }),
          )

          updateDecorations()
          console.log(
            "owoify-editor: textreplace API linked successfully.",
          )
        }
      })()
    }
  }
  // 1. Try immediately
  updateRegistration()

  // 2. Also listen for any extension state changes
  // (In case textreplace is installed/activated later)
  context.subscriptions.push(
    vscode.extensions.onDidChange(() => updateRegistration()),
  )
  function getTextReplaceApi(): TextReplaceApi | undefined {
    if (textReplaceApi) return textReplaceApi
    const ext = vscode.extensions.getExtension<TextReplaceApi>(
      "rssaromeo.textreplace",
    )
    if (ext?.isActive) {
      textReplaceApi = ext.exports
      context.subscriptions.push(
        textReplaceApi.onDidUpdateRanges((uri) => {
          // Find the visible editor for this URI and force a re-decoration
          const editor = vscode.window.visibleTextEditors.find(
            (e) => e.document.uri.toString() === uri.toString(),
          )
          if (editor) {
            // This will re-calculate owo decorations and
            // skip the new ranges owned by textreplace
            updateDecorationsForEditor(editor)
          }
        }),
      )
      updateDecorations()
    }
    return textReplaceApi
  }

  // Decoration for normal text (removes original, adds transformed)
  const owoDecorationType =
    vscode.window.createTextEditorDecorationType({
      textDecoration:
        "none; opacity: 0 !important; visibility: hidden;",
      color: "var(--vscode-editor-foreground)",
    })

  function updateDecorations() {
    for (const editor of vscode.window.visibleTextEditors) {
      updateDecorationsForEditor(editor)
    }
  }
  function updateDecorationsForEditor(editor: vscode.TextEditor) {
    const decorations: vscode.DecorationOptions[] = []
    // for (const range of editor.visibleRanges) {
    //   const text = editor.document.getText(range)
    const text = editor.document.getText()
    const baseOffset = 0
    // ✅ KEY: base offset of this visible range
    // const baseOffset = editor.document.offsetAt(range.start)

    const wordRegex = /\b\w+\b/g

    let match
    while ((match = wordRegex.exec(text))) {
      const original = match[0]
      const transformed = owowify(original)

      const reservedRanges =
        getTextReplaceApi()?.getDecoratedRanges(editor.document) ?? []

      if (transformed === original) continue

      // ✅ FIX: convert to document offset
      const wordOffset = baseOffset + match.index

      const basePos = editor.document.positionAt(wordOffset)
      const wordRange = new vscode.Range(
        editor.document.positionAt(wordOffset),
        editor.document.positionAt(wordOffset + original.length),
      )
      if (reservedRanges.some((r) => r.intersection(wordRange)))
        continue

      for (
        let i = 0, j = 0;
        i < original.length || j < transformed.length;
      ) {
        const oldChar = original[i]
        const newChar = transformed[j]

        // ✅ FIX: always use document offset
        const startPos = basePos.translate(0, i)

        if (oldChar === newChar) {
          i++
          j++
          continue
        }

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
                textDecoration:
                  "none; position: absolute; width: 1ch;",
              },
            },
          })

          i++
          j++
        } else if (newChar && oldChar === transformed[j + 1]) {
          decorations.push({
            range: new vscode.Range(startPos, startPos),
            renderOptions: {
              before: {
                contentText: newChar,
                color: "inherit",
                textDecoration:
                  "none; position: relative; display: inline-block; width: 1ch;",
              },
            },
          })

          j++
        } else if (oldChar && original[i + 1] === newChar) {
          const endPos = editor.document.positionAt(
            wordOffset + i + 1,
          )

          decorations.push({
            range: new vscode.Range(startPos, endPos),
          })

          i++
        } else {
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
                    "none; position: absolute; width: 1ch;"
                  : "none; position: relative;",
              },
            },
          })

          if (oldChar) i++
          if (newChar) j++
        }
      }
    }
    // }

    editor.setDecorations(owoDecorationType, decorations)
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
  vscode.window.onDidChangeTextEditorVisibleRanges((e) => {
    updateDecorationsForEditor(e.textEditor)
  })
  updateDecorations()
}

export function deactivate() {}
