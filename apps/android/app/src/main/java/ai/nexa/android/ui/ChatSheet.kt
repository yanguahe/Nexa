package ai.nexa.android.ui

import androidx.compose.runtime.Composable
import ai.nexa.android.MainViewModel
import ai.nexa.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
