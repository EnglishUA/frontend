# frozen_string_literal: true

URL_SEMANTIC_RELEASE = 'https://gitlab.com/gitlab-org/gitlab-ui/blob/master/CONTRIBUTING.md#conventional-commits'
SEMANTIC_COMMIT_TYPES = %w[build chore ci docs feat fix perf refactor revert style test].freeze

COMMIT_SUBJECT_MAX_LENGTH = 72
COMMIT_BODY_MAX_LENGTH = 144

# Commit messages that start with one of the prefixes below won't be linted
IGNORED_COMMIT_MESSAGES = [
  'Merge branch',
  'Revert "',
  'chore: update snapshots'
].freeze

# Perform various checks against commits. We're not using
# https://github.com/jonallured/danger-commit_lint because its output is not
# very helpful, and it doesn't offer the means of ignoring merge commits.

def fail_commit(commit, message)
  fail("#{commit.sha}: #{message}") # rubocop:disable Style/SignalException
end

def warn_commit(commit, message)
  warn("#{commit.sha}: #{message}")
end

def lines_changed_in_commit(commit)
  commit.diff_parent.stats[:total][:lines]
end

def too_many_changed_lines?(commit)
  commit.diff_parent.stats[:total][:files] > 10 &&
    lines_changed_in_commit(commit) >= 100
end

def match_semantic_commit(text)
  text.match(/^(?<type>\w+)(?:\((?<scope>.+?)\))?:(?<description>.+?)$/)
end

def add_release_type_markdown(type)
  markdown(<<~MARKDOWN)
    ## \u{1f4e6} #{type.capitalize} ([conventional commits](#{URL_SEMANTIC_RELEASE}))
  MARKDOWN
end

def lint_commit(commit)
  # For now we'll ignore merge commits, as getting rid of those is a problem
  # separate from enforcing good commit messages.
  # We also ignore revert commits as they are well structured by Git already
  if commit.message.start_with?(*IGNORED_COMMIT_MESSAGES)
    return { failed: false }
  end

  failed = false
  subject, separator, details = commit.message.split("\n", 3)

  if subject.length > COMMIT_SUBJECT_MAX_LENGTH
    fail_commit(
      commit,
      "The commit subject may not be longer than #{COMMIT_SUBJECT_MAX_LENGTH} characters"
    )

    failed = true
  end

  # Fail if a suggestion commit is used and squash is not enabled
  if commit.message.start_with?('Apply suggestion to') && !github.pr_json['squash']
    fail_commit(
      commit,
      'If you are applying suggestions, squash needs to be enabled in the pull request'
    )

    failed = true
  end

  if subject.end_with?('.')
    fail_commit(commit, 'The commit subject must not end with a period')
    failed = true
  end

  if separator && !separator.empty?
    fail_commit(
      commit,
      'The commit subject and body must be separated by a blank line'
    )

    failed = true
  end

  details&.each_line do |line|
    line = line.strip

    next if line.length <= COMMIT_BODY_MAX_LENGTH

    url_size = line.scan(%r{(https?://\S+)}).sum { |(url)| url.length }

    # If the line includes a URL, we'll allow it to exceed 72 characters, but
    # only if the line _without_ the URL does not exceed this limit.
    next if line.length - url_size <= COMMIT_BODY_MAX_LENGTH

    fail_commit(
      commit,
      "The commit body should not contain more than #{COMMIT_BODY_MAX_LENGTH} characters per line"
    )

    failed = true
  end

  if !details && too_many_changed_lines?(commit)
    fail_commit(
      commit,
      'Commits that change 30 or more lines across at least three files ' \
        'must describe these changes in the commit body'
    )

    failed = true
  end

  semantic_commit = match_semantic_commit(subject)

  if !semantic_commit
    fail_commit(commit, 'The commit does not comply with conventional commits specifications.')

    failed = true
  elsif !SEMANTIC_COMMIT_TYPES.include?(semantic_commit[:type])
    fail_commit(
      commit,
      "The semantic commit type `#{semantic_commit[:type]}` is not a well-known semantic commit type."
    )

    failed = true
  end

  { failed: failed }
end

def lint_commits(commits)
  commits_with_status = commits.map { |commit| { commit: commit }.merge(lint_commit(commit)) }

  failed = commits_with_status.any? { |commit| commit[:failed] }

  max_release = commits_with_status.max { |a, b| a[:release] <=> b[:release] }

  if failed
    markdown(<<~MARKDOWN)
      ## Commit message standards

      One or more commit messages do not meet our Git commit message standards.
      For more information on how to write a good commit message, take a look at
      [Conventional commits](#{URL_SEMANTIC_RELEASE}).

      Here is an example of a good commit message:

          feat(progressbar): Improve rendering performance in Edge

          Our progressbar component was causing a lot of re-renders in Edge.
          This was caused by excessive re-rendering due to floating point errors
          in Edge's JavaScript engine.

          By utilizing the better-math library we avoid those calculation errors
          and we can achieve 120 rendering frames per second again.

      This is an example of a bad commit message:

          fixed progressbar

    MARKDOWN
  end

  return if github.pr_json['squash']
end

def lint_pr(pr)
  if pr && pr['squash']
    pr_title = pr['title'][/(^WIP: +)?(.*)/, 2]
    semantic_commit = match_semantic_commit(pr_title)

    if !semantic_commit
      warn(
        'Your pull request has **Squash and merge** enabled but its title does not comply with conventional commits specifications'
      )
    elsif !SEMANTIC_COMMIT_TYPES.include?(semantic_commit[:type])
      warn(
        "The semantic commit type `#{semantic_commit[:type]}` is not a well-known semantic commit type."
      )
    end
  end
end

lint_commits(git.commits)
lint_pr(github.pr_json)

if git.commits.length > 10
  warn(
    'This pull request includes more than 10 commits. ' \
      'Please rebase these commits into a smaller number of commits.'
  )
end
