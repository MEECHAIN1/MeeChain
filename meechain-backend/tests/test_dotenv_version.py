"""
Tests for python-dotenv==1.0.1 (PR: downgrade from 1.2.2 to 1.0.1)

Covers:
- Installed package version matches the pinned version in requirements.txt
- Core python-dotenv API (load_dotenv, dotenv_values, find_dotenv, set_key, unset_key)
- .env file parsing edge cases used by pydantic-settings
- pydantic-settings integration (how the app actually uses dotenv)
- Regression cases for features that differ between dotenv versions
"""

import importlib.metadata
import os
import sys
import tempfile
import textwrap
from pathlib import Path

import pytest
from dotenv import dotenv_values, find_dotenv, load_dotenv, set_key, unset_key


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _write_env(tmp_path: Path, content: str) -> Path:
    """Write a .env file and return its path."""
    env_file = tmp_path / ".env"
    env_file.write_text(textwrap.dedent(content), encoding="utf-8")
    return env_file


# ---------------------------------------------------------------------------
# 1. Package version
# ---------------------------------------------------------------------------


class TestPackageVersion:
    """Verify the pinned python-dotenv version is actually installed."""

    def test_installed_version_is_1_0_1(self):
        version = importlib.metadata.version("python-dotenv")
        assert version == "1.0.1", (
            f"Expected python-dotenv==1.0.1 but found {version}. "
            "Check requirements.txt and re-install dependencies."
        )

    def test_dotenv_module_importable(self):
        import dotenv  # noqa: F401

    def test_dotenv_exposes_required_public_api(self):
        """All public symbols that pydantic-settings and the app rely on must exist."""
        from dotenv import dotenv_values, find_dotenv, load_dotenv, set_key, unset_key  # noqa: F401


# ---------------------------------------------------------------------------
# 2. Core load_dotenv() behaviour
# ---------------------------------------------------------------------------


class TestLoadDotenv:
    """Tests for the load_dotenv() function."""

    def test_loads_simple_key_value(self, tmp_path, monkeypatch):
        env_file = _write_env(tmp_path, "SIMPLE_KEY=hello_world\n")
        monkeypatch.delenv("SIMPLE_KEY", raising=False)
        load_dotenv(dotenv_path=env_file)
        assert os.environ.get("SIMPLE_KEY") == "hello_world"

    def test_does_not_override_existing_env_var_by_default(self, tmp_path, monkeypatch):
        monkeypatch.setenv("EXISTING_VAR", "from_environment")
        env_file = _write_env(tmp_path, "EXISTING_VAR=from_dotenv\n")
        load_dotenv(dotenv_path=env_file, override=False)
        assert os.environ["EXISTING_VAR"] == "from_environment"

    def test_override_true_replaces_existing_env_var(self, tmp_path, monkeypatch):
        monkeypatch.setenv("OVERRIDE_VAR", "original")
        env_file = _write_env(tmp_path, "OVERRIDE_VAR=replaced\n")
        load_dotenv(dotenv_path=env_file, override=True)
        assert os.environ["OVERRIDE_VAR"] == "replaced"

    def test_returns_true_on_success(self, tmp_path):
        env_file = _write_env(tmp_path, "KEY=value\n")
        result = load_dotenv(dotenv_path=env_file)
        assert result is True

    def test_returns_false_when_file_missing(self, tmp_path):
        missing = tmp_path / "nonexistent.env"
        result = load_dotenv(dotenv_path=missing)
        assert result is False

    def test_utf8_encoded_values(self, tmp_path, monkeypatch):
        env_file = _write_env(tmp_path, "UTF8_VAR=日本語\n")
        monkeypatch.delenv("UTF8_VAR", raising=False)
        load_dotenv(dotenv_path=env_file, encoding="utf-8")
        assert os.environ.get("UTF8_VAR") == "日本語"

    def test_empty_file_loads_without_error(self, tmp_path):
        env_file = _write_env(tmp_path, "")
        result = load_dotenv(dotenv_path=env_file)
        assert result is True


# ---------------------------------------------------------------------------
# 3. Core dotenv_values() behaviour
# ---------------------------------------------------------------------------


class TestDotenvValues:
    """Tests for the dotenv_values() function (used internally by pydantic-settings)."""

    def test_returns_dict_of_key_value_pairs(self, tmp_path):
        env_file = _write_env(tmp_path, "FOO=bar\nBAZ=qux\n")
        result = dotenv_values(dotenv_path=env_file)
        assert result == {"FOO": "bar", "BAZ": "qux"}

    def test_ignores_comment_lines(self, tmp_path):
        content = "# This is a comment\nACTUAL_KEY=value\n"
        env_file = _write_env(tmp_path, content)
        result = dotenv_values(dotenv_path=env_file)
        assert "ACTUAL_KEY" in result
        assert not any(k.startswith("#") for k in result)

    def test_ignores_blank_lines(self, tmp_path):
        content = "\nKEY1=val1\n\nKEY2=val2\n\n"
        env_file = _write_env(tmp_path, content)
        result = dotenv_values(dotenv_path=env_file)
        assert result == {"KEY1": "val1", "KEY2": "val2"}

    def test_double_quoted_value_strips_quotes(self, tmp_path):
        env_file = _write_env(tmp_path, 'QUOTED="hello world"\n')
        result = dotenv_values(dotenv_path=env_file)
        assert result["QUOTED"] == "hello world"

    def test_single_quoted_value_strips_quotes(self, tmp_path):
        env_file = _write_env(tmp_path, "SINGLE='hello world'\n")
        result = dotenv_values(dotenv_path=env_file)
        assert result["SINGLE"] == "hello world"

    def test_unquoted_value_preserved_as_is(self, tmp_path):
        env_file = _write_env(tmp_path, "PLAIN=no_quotes\n")
        result = dotenv_values(dotenv_path=env_file)
        assert result["PLAIN"] == "no_quotes"

    def test_empty_value_returns_empty_string(self, tmp_path):
        env_file = _write_env(tmp_path, "EMPTY=\n")
        result = dotenv_values(dotenv_path=env_file)
        assert result["EMPTY"] == ""

    def test_value_with_equals_sign(self, tmp_path):
        env_file = _write_env(tmp_path, 'ENCODED="user=admin&pass=secret"\n')
        result = dotenv_values(dotenv_path=env_file)
        assert result["ENCODED"] == "user=admin&pass=secret"

    def test_export_keyword_is_stripped(self, tmp_path):
        env_file = _write_env(tmp_path, "export EXPORTED_VAR=exported_value\n")
        result = dotenv_values(dotenv_path=env_file)
        assert result.get("EXPORTED_VAR") == "exported_value"
        assert "export EXPORTED_VAR" not in result

    def test_inline_comment_stripped_from_unquoted_value(self, tmp_path):
        env_file = _write_env(tmp_path, "KEY=value  # inline comment\n")
        result = dotenv_values(dotenv_path=env_file)
        # dotenv 1.0.x strips inline comments from unquoted values
        assert "comment" not in result.get("KEY", "")

    def test_inline_comment_preserved_in_quoted_value(self, tmp_path):
        env_file = _write_env(tmp_path, 'KEY="value # not a comment"\n')
        result = dotenv_values(dotenv_path=env_file)
        assert result["KEY"] == "value # not a comment"

    def test_empty_file_returns_empty_dict(self, tmp_path):
        env_file = _write_env(tmp_path, "")
        result = dotenv_values(dotenv_path=env_file)
        assert result == {}

    def test_utf8_encoding_parameter(self, tmp_path):
        env_file = _write_env(tmp_path, "LANG_VAR=日本語\n")
        result = dotenv_values(dotenv_path=env_file, encoding="utf-8")
        assert result["LANG_VAR"] == "日本語"

    def test_missing_file_returns_empty_dict(self, tmp_path):
        missing = tmp_path / "no_such_file.env"
        result = dotenv_values(dotenv_path=missing)
        assert result == {}

    def test_multiline_value_double_quoted(self, tmp_path):
        content = 'MULTI="line one\nline two"\n'
        env_file = _write_env(tmp_path, content)
        result = dotenv_values(dotenv_path=env_file)
        assert "\n" in result.get("MULTI", "")

    def test_variable_expansion_with_braces(self, tmp_path):
        content = "BASE=hello\nEXPANDED=${BASE}_world\n"
        env_file = _write_env(tmp_path, content)
        result = dotenv_values(dotenv_path=env_file)
        assert result.get("EXPANDED") == "hello_world"

    def test_duplicate_key_last_value_wins(self, tmp_path):
        content = "DUP_KEY=first\nDUP_KEY=second\n"
        env_file = _write_env(tmp_path, content)
        result = dotenv_values(dotenv_path=env_file)
        assert result["DUP_KEY"] == "second"


# ---------------------------------------------------------------------------
# 4. find_dotenv()
# ---------------------------------------------------------------------------


class TestFindDotenv:
    """Tests for the find_dotenv() helper."""

    def test_returns_string(self, tmp_path):
        (tmp_path / ".env").write_text("KEY=val\n")
        result = find_dotenv(filename=str(tmp_path / ".env"), raise_error_if_not_found=False)
        assert isinstance(result, str)

    def test_returns_empty_string_when_not_found(self):
        result = find_dotenv(filename="__no_such_dotenv__", raise_error_if_not_found=False)
        assert result == ""

    def test_raises_when_not_found_and_flag_set(self):
        with pytest.raises(IOError):
            find_dotenv(filename="__no_such_dotenv__", raise_error_if_not_found=True)


# ---------------------------------------------------------------------------
# 5. set_key() and unset_key()
# ---------------------------------------------------------------------------


class TestSetKeyUnsetKey:
    """Tests for set_key() and unset_key() helpers."""

    def test_set_key_writes_new_key(self, tmp_path):
        env_file = _write_env(tmp_path, "EXISTING=value\n")
        set_key(str(env_file), "NEW_KEY", "new_value")
        result = dotenv_values(dotenv_path=env_file)
        assert result["NEW_KEY"] == "new_value"

    def test_set_key_updates_existing_key(self, tmp_path):
        env_file = _write_env(tmp_path, "UPDATE_ME=old_value\n")
        set_key(str(env_file), "UPDATE_ME", "new_value")
        result = dotenv_values(dotenv_path=env_file)
        assert result["UPDATE_ME"] == "new_value"

    def test_unset_key_removes_key(self, tmp_path):
        env_file = _write_env(tmp_path, "REMOVE_ME=value\nKEEP_ME=keep\n")
        unset_key(str(env_file), "REMOVE_ME")
        result = dotenv_values(dotenv_path=env_file)
        assert "REMOVE_ME" not in result
        assert result["KEEP_ME"] == "keep"


# ---------------------------------------------------------------------------
# 6. pydantic-settings integration via Settings class
# ---------------------------------------------------------------------------


class TestPydanticSettingsIntegration:
    """
    Tests that verify pydantic-settings (which uses python-dotenv internally)
    works correctly with the pinned python-dotenv==1.0.1.

    Uses a minimal Settings subclass to avoid requiring live secrets.
    """

    def _make_settings_class(self, env_file: str):
        """Return a minimal Settings subclass pointing at a temp .env file."""
        from pydantic_settings import BaseSettings, SettingsConfigDict

        class TestSettings(BaseSettings):
            test_str_field: str = "default"
            test_int_field: int = 42
            test_bool_field: bool = False
            optional_field: str = "optional_default"

            model_config = SettingsConfigDict(
                env_file=env_file,
                env_file_encoding="utf-8",
                case_sensitive=False,
                extra="ignore",
            )

        return TestSettings

    def test_loads_values_from_env_file(self, tmp_path):
        env_file = _write_env(tmp_path, "TEST_STR_FIELD=from_dotenv\nTEST_INT_FIELD=99\n")
        Cls = self._make_settings_class(str(env_file))
        s = Cls()
        assert s.test_str_field == "from_dotenv"
        assert s.test_int_field == 99

    def test_env_var_overrides_dotenv_file(self, tmp_path, monkeypatch):
        env_file = _write_env(tmp_path, "TEST_STR_FIELD=from_file\n")
        monkeypatch.setenv("TEST_STR_FIELD", "from_environment")
        Cls = self._make_settings_class(str(env_file))
        s = Cls()
        assert s.test_str_field == "from_environment"

    def test_default_used_when_key_absent(self, tmp_path):
        env_file = _write_env(tmp_path, "")
        Cls = self._make_settings_class(str(env_file))
        s = Cls()
        assert s.test_str_field == "default"
        assert s.test_int_field == 42
        assert s.test_bool_field is False

    def test_case_insensitive_loading(self, tmp_path):
        # model_config has case_sensitive=False; uppercase env key must load
        env_file = _write_env(tmp_path, "TEST_STR_FIELD=case_insensitive\n")
        Cls = self._make_settings_class(str(env_file))
        s = Cls()
        assert s.test_str_field == "case_insensitive"

    def test_extra_keys_in_env_file_are_ignored(self, tmp_path):
        env_file = _write_env(tmp_path, "UNKNOWN_EXTRA_KEY=surprise\nTEST_STR_FIELD=hello\n")
        Cls = self._make_settings_class(str(env_file))
        # Should not raise even though UNKNOWN_EXTRA_KEY has no field
        s = Cls()
        assert s.test_str_field == "hello"

    def test_bool_field_loaded_from_env_file(self, tmp_path):
        env_file = _write_env(tmp_path, "TEST_BOOL_FIELD=true\n")
        Cls = self._make_settings_class(str(env_file))
        s = Cls()
        assert s.test_bool_field is True

    def test_missing_env_file_falls_back_to_defaults(self, tmp_path):
        missing_env = str(tmp_path / "does_not_exist.env")
        Cls = self._make_settings_class(missing_env)
        s = Cls()
        assert s.test_str_field == "default"

    def test_utf8_values_loaded_correctly(self, tmp_path):
        env_file = _write_env(tmp_path, "TEST_STR_FIELD=こんにちは\n")
        Cls = self._make_settings_class(str(env_file))
        s = Cls()
        assert s.test_str_field == "こんにちは"

    def test_quoted_value_in_env_file(self, tmp_path):
        env_file = _write_env(tmp_path, 'TEST_STR_FIELD="quoted value with spaces"\n')
        Cls = self._make_settings_class(str(env_file))
        s = Cls()
        assert s.test_str_field == "quoted value with spaces"

    def test_int_coercion_from_string_in_env_file(self, tmp_path):
        env_file = _write_env(tmp_path, "TEST_INT_FIELD=123\n")
        Cls = self._make_settings_class(str(env_file))
        s = Cls()
        assert s.test_int_field == 123
        assert isinstance(s.test_int_field, int)


# ---------------------------------------------------------------------------
# 7. Regression / boundary tests
# ---------------------------------------------------------------------------


class TestRegressionAndBoundary:
    """Extra regression and edge-case tests for python-dotenv 1.0.1."""

    def test_key_without_value_treated_as_empty_or_none(self, tmp_path):
        # A bare key with no '=' is treated as having no value by dotenv 1.0.x
        env_file = _write_env(tmp_path, "BARE_KEY\n")
        result = dotenv_values(dotenv_path=env_file)
        # The key should either not appear or have a None/empty value
        assert result.get("BARE_KEY") is None or result.get("BARE_KEY") == ""

    def test_value_with_hash_inside_double_quotes_not_stripped(self, tmp_path):
        env_file = _write_env(tmp_path, 'HASH_IN_VALUE="abc#def"\n')
        result = dotenv_values(dotenv_path=env_file)
        assert result["HASH_IN_VALUE"] == "abc#def"

    def test_windows_style_crlf_line_endings(self, tmp_path):
        env_file = tmp_path / ".env"
        env_file.write_bytes(b"CRLF_KEY=crlf_value\r\n")
        result = dotenv_values(dotenv_path=env_file)
        assert result.get("CRLF_KEY") == "crlf_value"

    def test_load_dotenv_verbose_does_not_raise(self, tmp_path):
        env_file = _write_env(tmp_path, "VERBOSE_KEY=verbose_val\n")
        # verbose=True should not raise; it just prints to stdout
        load_dotenv(dotenv_path=env_file, verbose=True)

    def test_dotenv_values_with_no_newline_at_eof(self, tmp_path):
        env_file = tmp_path / ".env"
        env_file.write_text("NO_NEWLINE=value", encoding="utf-8")
        result = dotenv_values(dotenv_path=env_file)
        assert result["NO_NEWLINE"] == "value"

    def test_value_containing_url_with_special_chars(self, tmp_path):
        url = "https://bsc-mainnet.nodereal.io/v1/abc123"
        env_file = _write_env(tmp_path, f"NODEREAL_RPC_URL={url}\n")
        result = dotenv_values(dotenv_path=env_file)
        assert result["NODEREAL_RPC_URL"] == url

    def test_multiple_env_files_independent_parsing(self, tmp_path):
        file_a = tmp_path / "a.env"
        file_a.write_text("KEY_A=alpha\n", encoding="utf-8")
        file_b = tmp_path / "b.env"
        file_b.write_text("KEY_B=beta\n", encoding="utf-8")
        result_a = dotenv_values(dotenv_path=file_a)
        result_b = dotenv_values(dotenv_path=file_b)
        assert result_a == {"KEY_A": "alpha"}
        assert result_b == {"KEY_B": "beta"}

    def test_set_key_creates_file_if_missing(self, tmp_path):
        new_file = str(tmp_path / "created.env")
        set_key(new_file, "CREATED_KEY", "created_val")
        result = dotenv_values(dotenv_path=new_file)
        assert result["CREATED_KEY"] == "created_val"
